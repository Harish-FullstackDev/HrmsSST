"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import chevronWhiteIcon from "@/assets/HrApplicants/icons/chevron-down-16-white.svg";
import closeIcon from "@/assets/HrApplicants/icons/close-24.svg";
import expandIcon from "@/assets/HrApplicants/icons/expand-20.svg";
import fileIcon from "@/assets/HrApplicants/icons/file-32.svg";
import HrConfirmDialog from "@/components/HrCommon/HrConfirmDialog";
import HrMenu from "@/components/HrCommon/HrMenu";
import { applicationFileUrl } from "@/lib/applications/actions";
import { APPLICANT_STATUSES, CONFIRM_STATUS, SETTABLE_STATUSES, formatAppliedOn, initialsOf } from "./applicantsData";

const CLOSE_MS = 300; // matches hr-drawer-out below

const detailLabel = "text-sm leading-[1.4] text-muted-ink";
const detailValue = "text-xs leading-[1.4] text-ink";

// Figma 2060:2170, right: the selected applicant in a 424 wide panel down the
// right edge. On desktop it sits beside the list (the HR shell makes room for
// anything marked data-hr-side-panel); on smaller screens, or with the resume
// expanded, it floats over the page with a backdrop. Escape or Cancel close
// it, and focus goes back to whatever opened it.
// It slides in, and slides back out before `onClose` runs (straight away
// when the visitor prefers reduced motion).
export default function ApplicantPanel({ applicant, onClose, onStatusChange }) {
    const [expanded, setExpanded] = useState(false);
    const [closing, setClosing] = useState(false);
    // A status waiting for HR to confirm (Job Offer, Onboarding, Rejected).
    const [confirming, setConfirming] = useState(null);
    // A short-lived link to the resume in Storage; null while loading,
    // "" when it couldn't be made.
    const [resumeUrl, setResumeUrl] = useState(null);
    const closeRef = useRef(null);
    const status = APPLICANT_STATUSES.find((option) => option.value === applicant.status);
    const isPdf = applicant.resume?.toLowerCase().endsWith(".pdf");

    useEffect(() => {
        let cancelled = false;
        applicationFileUrl(applicant.resumePath).then((result) => {
            if (!cancelled) setResumeUrl(result.ok ? result.url : "");
        });
        return () => {
            cancelled = true;
        };
    }, [applicant.resumePath]);

    useEffect(() => {
        const opener = document.activeElement;
        closeRef.current?.focus();
        return () => opener?.focus?.();
    }, []);

    // Without motion there is nothing to wait for, so close at once.
    const requestClose = useCallback(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) onClose();
        else setClosing(true);
    }, [onClose]);

    // Unmount once the 300ms slide-out has played. A timer rather than
    // animationend, so the panel can never get stuck open if no animation runs.
    useEffect(() => {
        if (!closing) return undefined;
        const timer = setTimeout(onClose, CLOSE_MS);
        return () => clearTimeout(timer);
    }, [closing, onClose]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape" && !event.defaultPrevented) requestClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [requestClose]);

    return (
        <>
            <div
                aria-hidden="true"
                onClick={requestClose}
                className={`fixed inset-0 z-40 bg-black/40 ${closing
                        ? "motion-safe:animate-[hr-fade-out_300ms_ease-in_forwards]"
                        : "motion-safe:animate-[hr-fade-in_200ms_ease-out]"
                    } ${expanded ? "" : "lg:hidden"}`}
            />
            {/* While closing, the shell stops making room (no
                data-hr-side-panel), so the list widens as the panel slides
                out over it. */}
            <aside
                aria-labelledby="applicant-panel-name"
                data-hr-side-panel={expanded || closing ? undefined : ""}
                className={`fixed top-0 right-0 z-40 flex h-dvh max-w-full flex-col gap-8 overflow-y-auto rounded-l-2xl border border-r-0 border-[#e3e8f0] bg-white px-6 pt-[19px] pb-16 ${closing
                        ? "pointer-events-none motion-safe:animate-[hr-drawer-out_300ms_ease-in_forwards]"
                        : "motion-safe:animate-[hr-drawer-in_300ms_ease-out]"
                    } ${expanded ? "w-[880px]" : "w-[424px]"}`}
            >
                <div className="flex flex-col gap-[22px]">
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={requestClose}
                        aria-label="Close applicant details"
                        className="self-end rounded p-0.5 hover:bg-surface-brand-subtle"
                    >
                        <Image src={closeIcon} alt="" width={24} height={24} />
                    </button>
                    <div className="flex items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#e3eefb] text-base leading-[1.2] text-[#084892]"
                        >
                            {initialsOf(applicant.name)}
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                            <h2 id="applicant-panel-name" className="text-lg leading-[1.2] font-medium text-[#1b2430]">
                                {applicant.name}
                            </h2>
                            <a href={`mailto:${applicant.email}`} className="truncate text-xs leading-[1.4] text-[#5b6676] hover:underline">
                                {applicant.email}
                            </a>
                        </div>
                    </div>
                </div>

                <section aria-labelledby="applicant-resume-label" className="flex min-h-[260px] flex-1 flex-col gap-2">
                    <h3 id="applicant-resume-label" className="text-base leading-[1.2] text-[#5b6676]">
                        Resume
                    </h3>
                    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-dashed border-[#b8c2d2] bg-[#f7f9fc] p-6">
                        {/* A PDF previews in place; other files (Word) open
                            from the file name. */}
                        {isPdf && resumeUrl && (
                            <iframe title={`Resume of ${applicant.name}`} src={resumeUrl} className="absolute inset-0 size-full bg-white" />
                        )}
                        <button
                            type="button"
                            onClick={() => setExpanded((value) => !value)}
                            aria-label={expanded ? "Shrink resume preview" : "Expand resume preview"}
                            aria-pressed={expanded}
                            className="absolute top-3 right-3 z-10 rounded bg-white/80 p-0.5 hover:bg-surface-brand-subtle"
                        >
                            <Image src={expandIcon} alt="" width={20} height={20} />
                        </button>
                        <Image src={fileIcon} alt="" width={32} height={32} />
                        {resumeUrl ? (
                            <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-center text-base leading-[1.2] break-all text-[#5b6676] hover:text-action hover:underline"
                            >
                                {applicant.resume}
                            </a>
                        ) : (
                            <p className="text-center text-base leading-[1.2] break-all text-[#5b6676]">
                                {applicant.resume}
                                {resumeUrl === "" && <span className="mt-1 block text-xs text-required">The file couldn&apos;t be loaded.</span>}
                            </p>
                        )}
                    </div>
                </section>

                <dl className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-3">
                        <dt className={detailLabel}>Role</dt>
                        <dd className={detailValue}>{applicant.role}</dd>
                    </div>
                    <div className="flex flex-col gap-3">
                        <dt className={detailLabel}>Type</dt>
                        <dd className={detailValue}>{applicant.type}</dd>
                    </div>
                    <div className="flex flex-col gap-3 text-right">
                        <dt className={detailLabel}>Applied on</dt>
                        <dd className={detailValue}>{formatAppliedOn(applicant.appliedOn)}</dd>
                    </div>
                </dl>

                <div className="flex gap-9">
                    <HrMenu
                        label={`Stage: ${status.label}`}
                        align="start"
                        // "Applied" is where every application starts, and "Withdrawn" is the
                        // candidate's own action, so neither is offered here. Job
                        // Offer, Onboarding and Rejected ask to confirm first.
                        items={SETTABLE_STATUSES.map((option) => ({
                            label: option.label,
                            selected: option.value === applicant.status,
                            onSelect: () => {
                                if (option.value === applicant.status) return;
                                if (CONFIRM_STATUS[option.value]) setConfirming(option.value);
                                else onStatusChange(applicant.id, option.value);
                            },
                        }))}
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-action text-base leading-[1.2] text-[#f8f8f8] transition-colors hover:bg-primary"
                    >
                        {status.label}
                        <Image src={chevronWhiteIcon} alt="" width={16} height={16} />
                    </HrMenu>
                    <button
                        type="button"
                        onClick={requestClose}
                        className="h-11 flex-1 rounded-lg border border-action text-base leading-[1.2] text-action transition-colors hover:bg-surface-brand-subtle"
                    >
                        Cancel
                    </button>
                </div>
            </aside>

            {confirming && (
                <HrConfirmDialog
                    title={CONFIRM_STATUS[confirming].title(1)}
                    message={CONFIRM_STATUS[confirming].text(applicant.name)}
                    confirmLabel={CONFIRM_STATUS[confirming].confirmLabel}
                    tone={CONFIRM_STATUS[confirming].tone}
                    onCancel={() => setConfirming(null)}
                    onConfirm={() => {
                        setConfirming(null);
                        onStatusChange(applicant.id, confirming);
                    }}
                />
            )}
        </>
    );
}
