"use client";

import { useEffect, useRef, useState } from "react";

import { getJobForEdit } from "@/lib/jobs/actions";
import { todayIso } from "@/lib/jobs/jobForm";
import JobForm from "./JobForm";

// The Create / Edit Job form in a modal over Job Openings. A native <dialog>
// opened with showModal(): it sits in the top layer (nothing on the page can
// cover it), keeps Tab inside, and makes the page behind inert.
// `target` is { mode: "create" }, { mode: "edit", id }, or
// { mode: "duplicate", id }: a new job filled in with that job's details (to
// post the same role on other terms, say Contract beside Full-time). It gets
// its own job ID when saved, and a past closing date is cleared. Escape, a click on
// the backdrop or Back close it, asking first when there are unsaved changes;
// `onSaved` runs after a successful save.
export default function JobFormDialog({ target, onClose, onSaved }) {
    const dialogRef = useRef(null);
    const dirtyRef = useRef(false);
    // For editing: null while loading, then { job } or { error }.
    const [loaded, setLoaded] = useState(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog.showModal();
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = overflow;
            dialog.close();
        };
    }, []);

    useEffect(() => {
        if (target.mode === "create") return;
        let cancelled = false;
        getJobForEdit(target.id)
            .then((result) => !cancelled && setLoaded(result.ok ? { job: result.job } : { error: result.error }))
            .catch(() => !cancelled && setLoaded({ error: "This job couldn't be loaded. Please try again." }));
        return () => {
            cancelled = true;
        };
    }, [target]);

    const requestClose = () => {
        if (dirtyRef.current && !window.confirm("Discard your changes to this job?")) return;
        onClose();
    };

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="job-form-title"
            // Escape: an open suggestion list inside the form closes first
            // (its field has aria-expanded=true); otherwise ask before leaving.
            onKeyDown={(event) => {
                if (event.key === "Escape" && event.target.getAttribute?.("aria-expanded") === "true") event.preventDefault();
            }}
            onCancel={(event) => {
                event.preventDefault();
                requestClose();
            }}
            // A click on the dialog element itself is a click on the backdrop.
            onClick={(event) => event.target === event.currentTarget && requestClose()}
            className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[1152px] overflow-y-auto rounded-xl bg-white p-0 shadow-[0_10px_40px_rgba(14,43,75,0.25)] backdrop:bg-black/40 motion-safe:animate-[apply-fade-in_200ms_ease-out_backwards]"
        >
            {target.mode === "create" ? (
                <JobForm onCancel={requestClose} onSaved={onSaved} dirtyRef={dirtyRef} />
            ) : loaded?.job && target.mode === "duplicate" ? (
                <JobForm
                    heading={`Duplicate ${loaded.job.code}`}
                    initial={{
                        ...loaded.job.values,
                        closingDate: loaded.job.values.closingDate >= todayIso() ? loaded.job.values.closingDate : "",
                    }}
                    onCancel={requestClose}
                    onSaved={onSaved}
                    dirtyRef={dirtyRef}
                />
            ) : loaded?.job ? (
                <JobForm
                    jobId={loaded.job.id}
                    jobCode={loaded.job.code}
                    status={loaded.job.status}
                    initial={loaded.job.values}
                    onCancel={requestClose}
                    onSaved={onSaved}
                    dirtyRef={dirtyRef}
                />
            ) : (
                <div className="flex flex-col items-start gap-4 p-6">
                    <h2 id="job-form-title" className="text-base leading-[1.2] font-medium text-ink">
                        {target.mode === "duplicate" ? "Duplicate Job" : "Edit Job"}
                    </h2>
                    {loaded?.error ? (
                        <p role="alert" className="text-sm leading-[1.4] text-required">
                            {loaded.error}
                        </p>
                    ) : (
                        <div aria-busy="true" className="h-[480px] w-full animate-pulse rounded-lg bg-neutral-100" />
                    )}
                    <button type="button" onClick={onClose} className="text-sm text-action hover:underline">
                        Close
                    </button>
                </div>
            )}
        </dialog>
    );
}
