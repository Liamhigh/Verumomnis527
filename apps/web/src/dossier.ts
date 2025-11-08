import { sha512string } from "@verum/core/hashing";

export type Dossier = {
    caseId: string; // e.g. sha512 of first uploaded pack
    lastReportHash?: string; // sha512 of last full report text
    lastSummary?: string; // ≤1–2k chars, auto-summarized
    evidenceHashes: string[]; // uploaded files (sha512)
    updatedAt: string; // ISO
};

const KEY = "vo:dossier";

export function loadDossier(): Dossier | null {
    try {
        const item = localStorage.getItem(KEY);
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
}

export function saveDossier(d: Dossier) {
    try {
        localStorage.setItem(KEY, JSON.stringify({
            ...d,
            updatedAt: new Date().toISOString()
        }));
    } catch (error) {
        console.error("Failed to save dossier:", error);
    }
}
