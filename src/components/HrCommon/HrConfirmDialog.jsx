"use client";

import { useEffect, useRef, useState } from "react";

// Asks HR to confirm an action before it runs. A native <dialog> opened with
// showModal(), so it sits above everything (side panels included), keeps Tab
// inside and makes the page behind inert. Escape, the backdrop or Cancel close
// it; Escape is marked handled so a panel underneath doesn't close as well.
// `onConfirm` may be async: the buttons stay disabled until it settles, and
// a returned { error } shows in the dialog instead of closing it.
// `tone="danger"` paints the confirm button red (Reject and the like).
export default function HrConfirmDialog({ title, message, confirmLabel = "Confirm", tone = "default", onConfirm, onCancel }) {
    const dialogRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog.showModal();
        return () => dialog.close();
    }, []);

    const cancel = () => {
        if (!busy) onCancel();
    };

    const confirm = async () => {
        setBusy(true);
        setError("");
        try {
            const result = await onConfirm();
            if (result?.error) {
                setError(result.error);
                setBusy(false);
            }
        } catch {
            setError("Something went wrong. Please try again.");
            setBusy(false);
        }
    };

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="hr-confirm-title"
            aria-describedby="hr-confirm-message"
            onKeyDown={(event) => {
                // Handled here (which also stops the native cancel), and
                // marked so listeners further up leave it alone.
                if (event.key === "Escape") {
                    event.preventDefault();
                    cancel();
                }
            }}
            onCancel={(event) => {
                event.preventDefault();
                cancel();
            }}
            onClick={(event) => event.target === event.currentTarget && cancel()}
            className="m-auto w-[calc(100%-32px)] max-w-[440px] rounded-xl bg-white p-0 shadow-[0_10px_40px_rgba(14,43,75,0.25)] backdrop:bg-black/40 motion-safe:animate-[apply-fade-in_200ms_ease-out_backwards]"
        >
            <div className="flex flex-col gap-4 p-6">
                <h2 id="hr-confirm-title" className="text-lg leading-[1.2] font-medium text-ink">
                    {title}
                </h2>
                <div id="hr-confirm-message" className="text-sm leading-[1.4] text-ink-secondary">
                    {message}
                </div>
                {error && (
                    <p role="alert" className="text-sm leading-[1.4] text-required">
                        {error}
                    </p>
                )}
                <div className="mt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={cancel}
                        disabled={busy}
                        className="h-10 rounded-lg border border-border-default px-5 text-sm leading-[1.4] text-ink-secondary transition-colors hover:bg-neutral-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        // Focused on open, so Enter confirms.
                        autoFocus
                        onClick={confirm}
                        disabled={busy}
                        className={`h-10 rounded-lg px-5 text-sm leading-[1.4] text-white transition-colors disabled:opacity-60 ${
                            tone === "danger" ? "bg-[#b43838] hover:bg-required" : "bg-action hover:bg-[#005192]"
                        }`}
                    >
                        {busy ? "Saving…" : confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
