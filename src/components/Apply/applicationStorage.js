// Keeps the in-progress application across reloads in this browser tab:
// answers and progress go to sessionStorage, the resume file to IndexedDB
// (too large for sessionStorage). Everything is best-effort; if storage is
// unavailable the application simply lives in memory as before.

const KEY = "hrms-apply";
const DB_NAME = "hrms-apply";
const STORE = "files";

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function withStore(mode, run) {
    const db = await openDb();
    try {
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, mode);
            const request = run(tx.objectStore(STORE));
            tx.oncomplete = () => resolve(request?.result);
            tx.onerror = () => reject(tx.error);
        });
    } finally {
        db.close();
    }
}

// { stepData, maxVisited, resume, submitted, reference } from a previous visit
// in this tab, or null. An application started for a different job is not
// restored. Once submitted, only the flag and the reference are kept.
export async function loadApplication(jobSlug) {
    try {
        const raw = sessionStorage.getItem(KEY);
        if (!raw) return null;
        const {
            jobSlug: savedFor,
            stepData = {},
            maxVisited = 0,
            hasResume = false,
            submitted = false,
            reference = null,
            sentTo = null,
        } = JSON.parse(raw);
        if (savedFor !== jobSlug) return null;
        const resume = hasResume ? await withStore("readonly", (store) => store.get(KEY)).catch(() => null) : null;
        return { stepData, maxVisited, resume: resume ?? null, submitted, reference, sentTo };
    } catch {
        return null;
    }
}

// `sentTo` is the address the confirmation email went to, for the thank-you message.
export function saveApplication({ jobSlug, stepData, maxVisited, hasResume, submitted, reference, sentTo }) {
    try {
        sessionStorage.setItem(KEY, JSON.stringify({ jobSlug, stepData, maxVisited, hasResume, submitted, reference, sentTo }));
    } catch {
        // Storage full or blocked: keep working in memory.
    }
}

// Drops the resume and every stage 5 document, once the application is sent.
export function clearApplicationFiles() {
    withStore("readwrite", (store) => store.clear()).catch(() => {});
}

export function saveResume(file) {
    withStore("readwrite", (store) => (file ? store.put(file, KEY) : store.delete(KEY))).catch(() => {});
}

// Stage 5's uploaded documents, kept next to the resume so the review can
// preview the photograph and signature. Best effort, like the rest.
// TODO: upload to the backend instead once it takes documents.
const documentKey = (field) => `${KEY}:document:${field}`;

export function saveDocumentFile(field, file) {
    withStore("readwrite", (store) => (file ? store.put(file, documentKey(field)) : store.delete(documentKey(field)))).catch(
        () => {},
    );
}

// The saved file, or null.
export async function loadDocumentFile(field) {
    try {
        return (await withStore("readonly", (store) => store.get(documentKey(field)))) ?? null;
    } catch {
        return null;
    }
}
