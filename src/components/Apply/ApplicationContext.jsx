"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
    clearApplicationFiles,
    loadApplication,
    saveApplication,
    saveResume,
} from "@/components/Apply/applicationStorage";

// Holds the in-progress application while the candidate moves between stages.
// It lives in the /apply layout and is also saved to this browser tab (see
// applicationStorage.js), so a reload restores it, unless it was for another
// job (`jobSlug`). Nothing is sent anywhere yet.
const ApplicationContext = createContext(null);

export function ApplicationProvider({ jobSlug, children }) {
    const [resume, setResumeState] = useState(null);
    // Form values per stage, keyed by the stage slug.
    const [stepData, setStepDataState] = useState({});
    // Furthest stage index the candidate has opened; the stepper lets them
    // click any stage up to here.
    const [maxVisited, setMaxVisited] = useState(0);
    // False until the saved application (if any) has been read back; stages
    // wait for it so their forms start from the restored answers.
    const [restored, setRestored] = useState(false);
    // True once the application is submitted: the stepper shows every stage
    // done, the review stage shows the thank-you message, and the other
    // stages send the candidate back to it (ApplyShell), so the browser's Back
    // button can't reopen the sent form. Kept in this tab with the reference.
    const [submitted, setSubmitted] = useState(false);
    const [reference, setReference] = useState(null);
    // Where the confirmation email went, for the thank-you message.
    const [sentTo, setSentTo] = useState(null);
    // The open stage's { save, validateNow } (see useStageControl), so the
    // stepper can keep or check its entries before leaving it.
    const stageControlRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        loadApplication(jobSlug).then((saved) => {
            if (cancelled) return;
            if (saved) {
                setStepDataState(saved.stepData);
                setMaxVisited(saved.maxVisited);
                setResumeState(saved.resume);
                setSubmitted(saved.submitted);
                setReference(saved.reference);
                setSentTo(saved.sentTo);
            }
            setRestored(true);
        });
        return () => {
            cancelled = true;
        };
    }, [jobSlug]);

    useEffect(() => {
        if (restored) {
            saveApplication({ jobSlug, stepData, maxVisited, hasResume: Boolean(resume), submitted, reference, sentTo });
        }
    }, [restored, jobSlug, stepData, maxVisited, resume, submitted, reference, sentTo]);

    // Marks the application sent and forgets its answers and files, keeping
    // only the reference and the confirmation address for the thank-you message.
    const completeApplication = useCallback((issuedReference, confirmationEmail = null) => {
        setReference(issuedReference);
        setSentTo(confirmationEmail);
        setSubmitted(true);
        setStepDataState({});
        setResumeState(null);
        clearApplicationFiles();
    }, []);

    const setResume = useCallback((file) => {
        setResumeState(file);
        saveResume(file);
    }, []);

    // Object URL for opening the uploaded file; revoked when it changes.
    const resumeUrl = useMemo(() => (resume ? URL.createObjectURL(resume) : null), [resume]);
    useEffect(() => () => resumeUrl && URL.revokeObjectURL(resumeUrl), [resumeUrl]);

    const setStepData = useCallback((slug, data) => setStepDataState((all) => ({ ...all, [slug]: data })), []);

    const value = useMemo(
        () => ({
            resume,
            resumeUrl,
            setResume,
            stepData,
            setStepData,
            maxVisited,
            setMaxVisited,
            restored,
            submitted,
            reference,
            sentTo,
            completeApplication,
            stageControlRef,
        }),
        [resume, resumeUrl, setResume, stepData, setStepData, maxVisited, restored, submitted, reference, sentTo, completeApplication],
    );

    return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}

export function useApplication() {
    const context = useContext(ApplicationContext);
    if (!context) throw new Error("useApplication must be used inside ApplicationProvider");
    return context;
}

// Registers the open stage's actions for the stepper: `save()` keeps its
// entries, `validateNow()` shows its errors and returns whether it is valid.
// Re-registers every render so the stepper always sees the latest values.
export function useStageControl(control) {
    const { stageControlRef } = useApplication();
    // Identifies this stage, so a stage being hidden (Next keeps the previous
    // page mounted but inactive) never clears the newly opened stage's entry.
    const [owner] = useState(() => ({}));
    useEffect(() => {
        stageControlRef.current = { ...control, owner };
    });
    useEffect(
        () => () => {
            if (stageControlRef.current?.owner === owner) stageControlRef.current = null;
        },
        [stageControlRef, owner],
    );
}

// Keeps the stage hidden until the saved application has been restored, then
// remounts it so its form starts from the restored answers. The stage is
// always rendered (not dropped), so Next can still render and validate the
// page segment on the server; `contents` keeps it out of the layout.
export function RestoredOnly({ children }) {
    const { restored } = useApplication();
    return (
        <div key={restored ? "restored" : "restoring"} className={restored ? "contents" : "invisible"} aria-busy={!restored}>
            {children}
        </div>
    );
}
