import React, { useState, lazy, Suspense } from 'react';

// --- Landing Page Component ---
const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="logo">VERUM <span>OMNIS</span></div>
                <h1>A Forensic Expert Witness in Your Pocket.</h1>
                <p className="sub-headline">For the first time, every person has free access to court-ready, verifiable truth. This is a gift to humanity.</p>
                <p className="core-tech">Validated in real-world legal proceedings, Verum Omnis is a stateless constitutional AI that delivers objective forensic analysis, governed by a sealed protocol to eliminate 'hallucinations' and ensure court-admissible reliability.</p>
            </header>

            <section className="landing-section">
                <h2>The 9-Brain Zero-Trust Architecture</h2>
                <p>Verum Omnis is not a single AI. It is a consensus-based system of nine specialized 'brains' that analyze evidence in parallel. A finding is only reported if three or more independent brains concur, passing strict constitutional checks.</p>
                <div className="brains-grid">
                    <div className="brain-item">
                        <h3>B1: Contradiction Engine</h3>
                        <p>Cross-checks all statements and evidence to classify direct, implied, and contextual contradictions.</p>
                    </div>
                     <div className="brain-item">
                        <h3>B2: Doc/Image Forensics</h3>
                        <p>Verifies file integrity, detects deepfakes, analyzes metadata, and identifies steganography.</p>
                    </div>
                     <div className="brain-item">
                        <h3>B4: Behavioural Linguistics</h3>
                        <p>Analyzes text for hedging density, evasion patterns, aggression spikes, and truth scarcity ratio.</p>
                    </div>
                     <div className="brain-item">
                        <h3>B7: Legal Compliance</h3>
                        <p>Applies jurisdiction-specific legal packs and checks for statutory triggers based on context.</p>
                    </div>
                </div>
            </section>

            <section className="landing-section">
                <h2>Court-Ready by Design</h2>
                <p>Every output is engineered to be legally admissible and tamper-proof, establishing an unbroken chain of custody from evidence to report.</p>
                <div className="features-grid">
                    <div className="feature-item">
                        <div className="feature-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5ZM8.25 8.25v3a3 3 0 0 0 3 3h1.5a3 3 0 0 0 3-3v-3a3.75 3.75 0 1 0-7.5 0Z" clipRule="evenodd" /></svg>
                        </div>
                        <h3>Constitutional Lock</h3>
                        <p>Analysis is governed by the immutable Verum Omnis Constitution—a public, SHA-512 sealed rule-set that guarantees a deterministic and auditable process.</p>
                    </div>
                    <div className="feature-item">
                         <div className="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0L2.22 10.222a.75.75 0 0 0 .516 1.278h2.097v5.302a2.25 2.25 0 0 0 2.25 2.25h8.834a2.25 2.25 0 0 0 2.25-2.25v-5.302h2.097a.75.75 0 0 0 .516-1.278L12.516 2.17ZM11.25 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" /></svg>
                        </div>
                        <h3>Dual-Hash Chain of Custody</h3>
                        <p>Evidence is secured with a public SHA-512 hash for court verification and a device-bound HMAC to prove an unbroken, verifiable chain of custody.</p>
                    </div>
                     <div className="feature-item">
                        <div className="feature-icon">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path fillRule="evenodd" d="M15.75 2.25a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /><path d="M18 9.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z" /><path fillRule="evenodd" d="M8.25 2.25a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /><path d="M4.5 9.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z" /><path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v18a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /><path d="M3.75 12a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" /><path fillRule="evenodd" d="M15.75 15.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /><path d="M18 15a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z" /><path fillRule="evenodd" d="M8.25 15.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /><path d="M4.5 15a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z" /></svg>
                        </div>
                        <h3>Immutable Blockchain Anchoring</h3>
                        <p>Key findings and case records are anchored to a public blockchain, creating a permanent, ownerless, and tamper-proof record that is beyond the control of any single entity.</p>
                    </div>
                     <div className="feature-item">
                        <div className="feature-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75a.75.75 0 0 0-1.5 0v7.5a.375.375 0 0 1-.375.375H5.625a.375.375 0 0 1-.375-.375V3.375c0-.207.168-.375.375-.375h5.25a.75.75 0 0 0 0-1.5h-5.25Z" /><path d="M12.75 3a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0V3Z" /><path d="m14.06 8.94-3.75-3.75a.75.75 0 1 0-1.06 1.06l3.75 3.75a.75.75 0 0 0 1.06-1.06Z" /></svg>
                        </div>
                        <h3>Certified PDF/A-3B Reports</h3>
                        <p>All reports are generated as sealed, court-admissible PDF/A-3B documents with zero compression, watermarks, and a QR code linking to the full SHA-512 hash for verification.</p>
                    </div>
                </div>
            </section>
            
            <footer className="landing-footer">
                <div className="cta-box">
                    <h3>A Gift to Humanity</h3>
                    <p>Verum Omnis will always be free for private citizens. Institutions may be subject to licensing fees after the initial trial period.</p>
                </div>
                <p className="final-tagline">Your evidence has a voice. Let it be heard.</p>
                <button className="enter-button" onClick={onEnter}>
                    Enter Application
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" /></svg>
                </button>
            </footer>
        </div>
    );
};

const ChatInterface = lazy(() => import('./ChatInterface'));

const LoadingSpinner = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: 'var(--background-dark)',
        color: 'var(--text-light)',
        fontFamily: 'var(--font-sans)',
    }}>
        <div className="spinner"></div>
        <p>Loading Application...</p>
    </div>
);

export default function App() {
    const [view, setView] = useState<'landing' | 'chat'>('landing');

    if (view === 'landing') {
        return <LandingPage onEnter={() => setView('chat')} />;
    }

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ChatInterface />
        </Suspense>
    );
};