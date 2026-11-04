"use client";

import { useRef } from "react";
import Image from "next/image";

import fileIcon from "@/assets/Apply/icons/file-16.svg";
import uploadIcon from "@/assets/Apply/icons/upload-16.svg";
import { fillClass } from "@/components/Apply/ApplyFormControls";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export const FILE_TYPES = {
    pdf: { mime: "application/pdf", label: "PDF" },
    png: { mime: "image/png", label: "PNG" },
    jpg: { mime: "image/jpeg", label: "JPG" },
};

// "PDF, PNG or JPG" from ["pdf", "png", "jpg"].
const typeList = (types) => {
    const labels = types.map((type) => FILE_TYPES[type].label);
    return labels.length > 1 ? `${labels.slice(0, -1).join(", ")} or ${labels.at(-1)}` : labels[0];
};

// Checks a picked file; returns an error message or null.
export function validateFile(file, types) {
    if (!types.some((type) => FILE_TYPES[type].mime === file.type)) return `Upload a ${typeList(types)} file.`;
    if (file.size > MAX_FILE_BYTES) return "The file is larger than 5 MB.";
    return null;
}

// Figma 1878:21581: a field-shaped file picker, upload icon and hint on the
// left, BROWSE on the right. `onPick(file, error)` gets the checked file, or
// null and the reason it was refused. Other buttons (e.g. Edit) can open it
// with `openFilePicker(id)`. Keyboard users reach the real file input, which
// shows its focus on the field.
export function ApplyFilePicker({ id, types, fileName, invalid, describedBy, onPick, label, onSubtle = false }) {
    const inputRef = useRef(null);
    const open = () => inputRef.current?.click();

    return (
        <>
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept={types.map((type) => FILE_TYPES[type].mime).join(",")}
                aria-label={label}
                aria-describedby={describedBy}
                className="peer sr-only"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    const error = validateFile(file, types);
                    onPick(error ? null : file, error);
                }}
            />
            <button
                type="button"
                onClick={open}
                aria-hidden="true"
                tabIndex={-1}
                className={`flex h-[42px] w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-[13px] text-sm leading-[1.4] transition-colors peer-focus-visible:border-action peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action hover:border-action ${
                    invalid ? "border-required" : "border-border-default"
                } ${fillClass(fileName, onSubtle)}`}
            >
                <span className="flex min-w-0 items-center gap-3">
                    <Image src={uploadIcon} alt="" width={16} height={16} className="shrink-0" />
                    <span className={`truncate ${fileName ? "text-ink" : "text-ink-disabled"}`}>
                        {fileName || `Choose ${typeList(types)} (Max 5 MB)`}
                    </span>
                </span>
                <span className="shrink-0 text-xs leading-[1.4] text-action">BROWSE</span>
            </button>
        </>
    );
}

export const openFilePicker = (id) => document.getElementById(id)?.click();

// Figma 1878:21533: an attached file's name on a small grey chip. `roomy`
// is the taller chip of the documents stage (Figma 1919:5265, 12/8 padding).
export function FileChip({ name, roomy = false }) {
    return (
        <span
            className={`inline-flex max-w-full items-center gap-2 rounded bg-[#f8f9fa] text-sm leading-[1.4] text-ink-secondary ${
                roomy ? "px-3 py-2" : "px-2.5 py-1"
            }`}
        >
            <Image src={fileIcon} alt="" width={16} height={16} className="shrink-0" />
            <span className="truncate">{name}</span>
        </span>
    );
}
