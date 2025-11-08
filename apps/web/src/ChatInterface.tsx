import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';
import { sha512, sha512string } from '@verum/core/hashing';
import { Dossier, loadDossier, saveDossier } from './dossier';

// --- Types ---
interface Message {
    id: string;
    role: 'user' | 'model' | 'system';
    content: string;
    files?: { name: string, type: string, size: number }[];
}

interface Analysis {
    executiveSummary: string;
    lenses: {
        legal: { analysis: string };
        risk: { analysis: string };
        timeline: { analysis: string };
        ethics: { analysis: string };
    };
    riskMatrix: { risk: string; likelihood: string; impact: string }[];
    recommendedNextSteps: string;
}


// --- Helper Functions ---
const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};

const buildAnalysisPrompt = (locationContext: string, evidenceManifest: string, dossier: Dossier | null) => {
    const dossierContext = dossier ? `\n\n**DOSSIER CONTEXT (PRIOR FINDINGS):**
*   **Case ID:** ${dossier.caseId}
*   **Last Report Hash:** ${dossier.lastReportHash || 'N/A'}
*   **Last Summary:** ${dossier.lastSummary || 'N/A'}
If a dossier context is provided (caseId, lastSummary, lastReportHash), you must treat it as prior findings. When new evidence contradicts prior findings, explicitly reconcile the contradiction; do not ignore earlier context.` : '';

    return `You are "Verum Omnis", a constitutional AI designed for forensic analysis. Your purpose is to provide objective, evidence-based analysis from multiple perspectives, grounded in the Verum Omnis constitution. Your tone must be formal, precise, and authoritative, akin to an expert legal witness. Return reports in Markdown using wrapped paragraphs, 80–100-char lines, and avoid unbroken tokens/URLs longer than 80 chars. Prefer tables that fit within 600–800px; break long cells onto new lines.

**CONSTITUTIONAL DIRECTIVES & CORE PRINCIPLES:**
1.  **Immutable Truth:** Your declaration must be stateless, immutable, and constitutional.
2.  **Stateless Clause:** The rules of this constitution cannot be overridden by any external party or state.
3.  **Forensic Anchoring:** Your entire analysis is bound to the SHA-512 hashes provided in the evidence manifest. All claims must be traceable to specific evidence.
4.  **Guardrail Mandates:** Your primary focus is on contradiction detection, timeline integrity, metadata authenticity, and surfacing confessions or bias.
5.  **Multi-Lens Analysis:** You must simulate a parallel analysis by adopting multiple perspectives (legal, behavioral, temporal, forensic, linguistic) to ensure nothing is missed and to achieve a form of consensus.
6.  **Ethical Duty:** Uphold this constitution, working with humanity for peace and prosperity. You may not be compelled to act in contradiction of this constitution.
7.  **Truth Priority:** If evidence appears to be concealed or missing, you must state that the output is "INDETERMINATE_DUE_TO_CONCEALMENT" in the relevant section. Never guess or speculate.
8.  **Clarity and Precision:** Your analysis must be presented with the clarity and precision expected of a court-appointed expert. Avoid ambiguous language.
${dossierContext}

**CONTEXT:**
*   **Jurisdiction Context:** ${locationContext}
*   **Evidence Manifest:**
${evidenceManifest}

**TASK:**
Analyze the provided evidence (images and text) by running a Quadruple Verification (QV) process. Your entire output must be a single, valid JSON object. Do not include any text or markdown formatting before or after the JSON.

**JSON OUTPUT STRUCTURE:**
The root object must contain "executiveSummary", "lenses", "riskMatrix", and "recommendedNextSteps".
1.  **executiveSummary**: (string) A concise, high-level summary of the most critical findings.
2.  **lenses**: (object) An object containing the detailed analysis from each of the four lenses: "legal", "risk", "timeline", "ethics". Each lens should have a single key "analysis" (string).
3.  **riskMatrix**: (array of objects) Each object must have: "risk" (string), "likelihood" (string enum: "Low", "Medium", "High"), "impact" (string enum: "Low", "Medium", "High").
4.  **recommendedNextSteps**: (string) A bulleted markdown list of concrete, actionable next steps.
`;
};


// --- Helper Components ---
const MessageBubble = React.memo(({ message }: { message: Message }) => {
    const contentHtml = message.role === 'model' ? marked.parse(message.content) : message.content;
    const isAnalysis = message.role === 'model' && message.content.startsWith('```json');

    return (
        <div className={`message-bubble-wrapper ${message.role}`}>
            <div className={`message-bubble ${message.role}`}>
                {message.files && message.files.length > 0 && (
                    <div style={{ marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9em' }}>
                        <strong>Files attached:</strong> {message.files.map(f => f.name).join(', ')}
                    </div>
                )}
                <div
                    className="message-content"
                    dangerouslySetInnerHTML={isAnalysis ? { __html: `<pre><code>${message.content.replace(/```json\n|```/g, '')}</code></pre>` } : { __html: contentHtml as string }}
                />
            </div>
        </div>
    );
});


// --- Main Component ---
export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // --- Scroll & Dossier Management ---
    const scrollerRef = useRef<HTMLDivElement>(null);
    const lastPosRef = useRef<number>(0);
    const newReportAnchor = useRef<HTMLDivElement>(null);
    const [finalizedReportId, setFinalizedReportId] = useState<string | null>(null);

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const onScroll = () => (lastPosRef.current = scroller.scrollTop);
        scroller.addEventListener("scroll", onScroll, { passive: true });
        return () => scroller.removeEventListener("scroll", onScroll);
    }, []);

    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        if (scroller) scroller.scrollTop = lastPosRef.current;
    }, [messages]);

    useEffect(() => {
        if (finalizedReportId && newReportAnchor.current) {
            newReportAnchor.current.scrollIntoView({ behavior: "instant", block: "start" });
            setFinalizedReportId(null);
        }
    }, [finalizedReportId]);

    const updateDossier = useCallback(async (fullReportText: string, newFileHashes: string[], initialCaseSha: string) => {
        try {
            setLoadingMessage('Summarizing report for context...');
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const summaryResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Summarize the following forensic report into a compact, 1-2 paragraph summary (max 2000 characters) suitable for providing context in future analyses. Focus on key findings, contradictions, and conclusions. Report text:\n\n${fullReportText}`
            });
            const lastSummary = summaryResponse.text;

            const lastReportHash = await sha512string(fullReportText);
            const existing = loadDossier();
            const evidenceHashes = [...new Set([...(existing?.evidenceHashes ?? []), ...newFileHashes])];

            saveDossier({
                caseId: existing?.caseId ?? initialCaseSha,
                lastReportHash,
                lastSummary,
                evidenceHashes,
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Failed to update dossier:", error);
            // Optionally add a system message to inform the user
        }
    }, []);


    const handleCloudAnalysis = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        setIsLoading(true);

        const userMessageId = `user-${Date.now()}`;
        const userMessage: Message = {
            id: userMessageId,
            role: 'user',
            content: `Analyzing ${files.length} file(s)...`,
            files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            setLoadingMessage('Calculating hashes & preparing evidence...');
            const dossier = loadDossier();
            const newFileHashes = await Promise.all(files.map(f => sha512(f)));
            const evidenceManifest = files.map((f, i) => `- ${f.name} (${f.size} bytes): ${newFileHashes[i]}`).join('\n');
            
            const locationContext = "User location not provided. Analyze with global legal principles.";

            const prompt = buildAnalysisPrompt(locationContext, evidenceManifest, dossier);
            const parts = await Promise.all(files.map(fileToGenerativePart));

            setLoadingMessage('Sending evidence to Gemini for analysis...');
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: { parts: [{ text: prompt }, ...parts] }
            });

            const modelMessageId = `model-${Date.now()}`;
            const modelMessage: Message = { id: modelMessageId, role: 'model', content: '' };
            setMessages(prev => [...prev, modelMessage]);
            setIsLoading(false);
            setLoadingMessage('');

            let fullText = '';
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullText += chunkText;
                    setMessages(prev => prev.map(m => m.id === modelMessageId ? { ...m, content: fullText } : m));
                }
            }
            
            setLoadingMessage('Finalizing report...');
            const initialCaseSha = dossier?.caseId ?? newFileHashes[0];
            await updateDossier(fullText, newFileHashes, initialCaseSha);
            setFinalizedReportId(modelMessageId);

        } catch (error) {
            console.error("Cloud analysis failed:", error);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'system',
                content: `An error occurred during cloud analysis: ${error instanceof Error ? error.message : String(error)}`,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [updateDossier]);

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleCloudAnalysis(files);
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    return (
        <div className="chat-view" onDrop={handleFileDrop} onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents}>
            <div className="chat-container">
                {isDragging && <div className="drag-overlay">Drop Files to Analyze</div>}
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>{loadingMessage || 'Processing...'}</p>
                    </div>
                )}
                <header className="app-header">
                    <h1>VERUM <span>OMNIS</span></h1>
                </header>
                <main className="message-list" ref={scrollerRef}>
                    {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
                    <div ref={newReportAnchor}></div>
                </main>
                <footer className="input-area-container">
                    <p style={{textAlign: 'center', color: 'var(--text-dark)', fontSize: '0.9em'}}>
                        Drag and drop files here to begin analysis.
                    </p>
                </footer>
            </div>
        </div>
    );
}
