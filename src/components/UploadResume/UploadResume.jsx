"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";

import fileIcon from "@/assets/Apply/icons/file-blue-16.svg";
import fileUpload from "@/assets/Apply/icons/file-upload-white-21.svg";
import { useApplication } from "@/components/Apply/ApplicationContext";

const ACCEPTED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_BYTES = 5 * 1024 * 1024;

const extensionOf = (name) => name.slice(name.lastIndexOf(".")).toLowerCase();

// Checks a picked/dropped file; returns an error message or null. Some
// browsers leave a Word file's type empty, so the extension also counts.
export function validateResume(file) {
    if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(extensionOf(file.name))) {
        return "Upload a PDF, DOC or DOCX file.";
    }
    if (file.size > MAX_BYTES) return "The file is larger than 5 MB.";
    return null;
}

function formatSize(bytes) {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Figma 1878:19507: the uploaded file's type badge, name (opens the file),
// size, and a Remove button.
function UploadedFile({ file, url, onRemove }) {
    return (
        <div className="flex w-full min-w-0 flex-col gap-4 pt-1">
            <h3 className="text-sm leading-4 font-medium tracking-[0.7px] text-ink-secondary uppercase">Uploaded file</h3>
            <div className="flex flex-col items-start gap-6 rounded-xl bg-surface-brand-subtle p-4">
                <div className="flex min-w-0 max-w-full items-center gap-4">
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-[#d5e2f2]">
                        <Image src={fileIcon} alt="" width={16} height={20} />
                        <span className="pt-0.5 text-[10px] leading-[10px] font-bold text-action uppercase">
                            {extensionOf(file.name).slice(1)}
                        </span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-lg leading-[1.2] font-medium text-ink hover:text-action hover:underline"
                        >
                            {file.name}
                        </a>
                        <p className="text-sm leading-[1.4] text-ink-secondary">{formatSize(file.size)}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={`Remove ${file.name}`}
                    className="cursor-pointer rounded-lg bg-white px-4 py-1 text-sm leading-[1.4] text-[#ba1a1a] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#fdf2f2]"
                >
                    Remove
                </button>
            </div>
        </div>
    );
}

// Figma 1878:19483: stage 1 of the application. A white card (755 wide on
// desktop) with the heading and a drop zone (click or drag a file onto it);
// once a file is in, the uploaded-file card sits beside it.
export default function UploadResume({ error, onError }) {
    const { resume, resumeUrl, setResume } = useApplication();
    const inputRef = useRef(null);
    const inputId = useId();
    const errorId = useId();
    const [dragging, setDragging] = useState(false);

    const takeFile = (file) => {
        if (!file) return;
        const problem = validateResume(file);
        onError(problem);
        if (!problem) setResume(file);
    };

    const openPicker = () => inputRef.current?.click();

    return (
        // Figma's 755 / 533 split with 24 between, scaled with the page width.
        <section className="grid w-full items-start gap-8 lg:grid-cols-[minmax(0,755fr)_minmax(0,533fr)] lg:gap-6">
            <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-6 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col">
                    <h2 className="text-base leading-[1.2] font-medium text-ink">
                        <label htmlFor={inputId}>
                            Upload Your Resume <span className="text-[#ef4444]">*</span>
                        </label>
                    </h2>
                    <p className="text-sm leading-[1.4] text-ink-secondary">
                        We process your resume to build your candidate profile in real time.
                    </p>
                </div>

                <input
                    ref={inputRef}
                    id={inputId}
                    type="file"
                    accept={[...ACCEPTED_TYPES, ...ACCEPTED_EXTENSIONS].join(",")}
                    aria-describedby={error ? errorId : undefined}
                    className="sr-only"
                    onChange={(event) => {
                        takeFile(event.target.files?.[0]);
                        event.target.value = "";
                    }}
                />

                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={openPicker}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setDragging(false);
                            takeFile(event.dataTransfer.files?.[0]);
                        }}
                        className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border p-10 text-center transition-colors ${
                            dragging
                                ? "border-action bg-primary-200/40"
                                : error
                                  ? "border-required bg-surface-brand-subtle"
                                  : "border-transparent bg-surface-brand-subtle hover:border-primary-200"
                        }`}
                    >
                        <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-action shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-105">
                            <Image src={fileUpload} alt="" width={21.33} height={26.67} />
                        </span>
                        <span className="pb-1 text-lg leading-[1.2] font-medium text-ink">
                            Drag and drop your resume here, or <span className="text-action">Browse files</span>
                        </span>
                        <span className="text-sm leading-[1.4] text-ink-secondary">
                            Supports PDF, DOC, or DOCX up to 5 MB
                        </span>
                    </button>

                    {error && (
                        <p id={errorId} role="alert" className="text-sm leading-5 text-required">
                            {error}
                        </p>
                    )}
                </div>
            </div>

            {resume && <UploadedFile file={resume} url={resumeUrl} onRemove={() => setResume(null)} />}
        </section>
    );
}
