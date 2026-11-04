"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import arrowBack from "@/assets/Apply/icons/arrow-back-16.svg";
import arrowForwardWhite from "@/assets/Apply/icons/arrow-forward-white-16.svg";
import { useApplication } from "@/components/Apply/ApplicationContext";
import { useApplyJob } from "@/components/Apply/ApplyShell";

const buttonClass = "flex h-11 items-center justify-center gap-1 rounded-lg px-6 py-3 text-sm leading-[1.4] transition-colors";

// Figma 1878:19529: a light Back button on the left; "Save and exit" and the
// primary Next (or Submit) on the right, 24 apart. Back is Figma's arrow
// flipped. `onBack` runs before Back navigates (e.g. to keep the stage's
// entries). Save and exit keeps the open stage's entries, which stay in this
// browser tab, and returns to the job.
export default function ApplyStepFooter({ backHref, onBack, onNext, nextLabel = "Next", busy = false }) {
    const router = useRouter();
    const job = useApplyJob();
    const { stageControlRef } = useApplication();

    const saveAndExit = () => {
        stageControlRef.current?.save();
        router.push(`/jobs/${job.slug}`);
    };

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex w-full items-center justify-between gap-4">
                <Link
                    href={backHref}
                    onClick={onBack}
                    className={`${buttonClass} bg-surface-brand-subtle text-ink hover:bg-primary-200/50`}
                >
                    <Image src={arrowBack} alt="" width={16} height={16} className="rotate-180" />
                    Back
                </Link>
                <div className="flex items-center gap-2 sm:gap-6">
                    <button
                        type="button"
                        onClick={saveAndExit}
                        className={`${buttonClass} cursor-pointer px-3 text-ink-secondary hover:text-ink sm:px-6`}
                    >
                        Save and exit
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={busy}
                        className={`${buttonClass} cursor-pointer bg-action text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-[#005192] disabled:cursor-wait disabled:opacity-70`}
                    >
                        {nextLabel}
                        <Image src={arrowForwardWhite} alt="" width={16} height={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
