"use client";

import { ApplyFilePicker, FileChip, openFilePicker } from "@/components/Apply/ApplyFilePicker";
import { messageIdFor } from "@/components/Apply/ApplyFormControls";
import { saveDocumentFile } from "@/components/Apply/applicationStorage";

const IMAGES = ["png", "jpg"];
const DOCUMENTS = ["pdf", "png", "jpg"];

// The documents asked for, in Figma's order. A `multiple` entry is optional
// and may hold several files.
export const DOCUMENTS_LIST = [
    { field: "photograph", label: "Photograph", types: IMAGES },
    { field: "signature", label: "Signature", types: IMAGES },
    { field: "idProof", label: "ID Proof with Photograph", types: DOCUMENTS },
    { field: "tenthMarksheet", label: "10th Marksheet", types: DOCUMENTS },
    { field: "twelfthMarksheet", label: "12th Marksheet / Diploma Certificate", types: DOCUMENTS },
    { field: "degreeCertificate", label: "Degree Certificate", types: DOCUMENTS },
];

// File names; single documents' files are also kept in this browser
// (applicationStorage) for the review's previews.
// TODO: upload the files once the backend takes documents.
export const emptyUploadDocuments = Object.fromEntries(
    DOCUMENTS_LIST.map(({ field, multiple }) => [field, multiple ? [] : ""]),
);

// Returns { field: message } for every missing required document.
export function validateUploadDocuments(values) {
    const errors = {};
    for (const { field, label, multiple } of DOCUMENTS_LIST) {
        if (!multiple && !values[field]) errors[field] = `Upload your ${label.toLowerCase()}.`;
    }
    return errors;
}

const linkButton = "cursor-pointer px-3 py-2 text-sm leading-[1.4] underline";

// Figma 1919:5253: one row: the label (320 wide), the picker (400 wide), then
// a thin divider and the uploaded file with Edit / Delete under it, 64 apart.
// The picker keeps its hint; the file's name shows on the right. Below xl the
// row would not fit, so the parts stack.
function DocumentRow({ field, label, types, multiple, value, error, onChange, onError }) {
    const files = multiple ? value ?? [] : value ? [value] : [];

    return (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-16">
            <label
                htmlFor={field}
                className="text-base leading-[1.2] font-medium text-[#374151] xl:w-[320px] xl:shrink-0"
            >
                {label}
                {!multiple && <span className="text-[#ef4444]"> *</span>}
            </label>
            <div className="flex w-full max-w-[400px] flex-col gap-1 xl:shrink-0">
                <ApplyFilePicker
                    id={field}
                    label={label}
                    types={types}
                    invalid={Boolean(error)}
                    describedBy={messageIdFor(field, { error })}
                    onPick={(file, problem) => {
                        if (problem) return onError(problem);
                        if (!multiple) saveDocumentFile(field, file);
                        onChange(multiple ? [...files, file.name] : file.name);
                    }}
                />
                {error && (
                    <p id={`${field}-message`} role="alert" className="text-xs leading-[1.4] text-required">
                        {error}
                    </p>
                )}
            </div>
            {files.length > 0 && (
                <ul className="flex min-w-0 flex-col gap-3 xl:self-stretch xl:border-l xl:border-border-default xl:pl-16">
                    {files.map((name, index) => (
                        <li
                            key={`${name}-${index}`}
                            className="flex flex-col items-start gap-1 motion-safe:animate-[apply-check-in_200ms_ease-out_backwards]"
                        >
                            <FileChip name={name} roomy />
                            <span className="flex items-center gap-1">
                                {!multiple && (
                                    <button
                                        type="button"
                                        onClick={() => openFilePicker(field)}
                                        aria-label={`Replace ${name}`}
                                        className={`${linkButton} text-muted-ink hover:text-ink`}
                                    >
                                        Edit
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!multiple) saveDocumentFile(field, null);
                                        onChange(multiple ? files.filter((_, i) => i !== index) : "");
                                    }}
                                    aria-label={`Delete ${name}`}
                                    className={`${linkButton} text-[#b43838] hover:text-required`}
                                >
                                    Delete
                                </button>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Figma 1919:5252: stage 5 of the application. One white card listing each
// document to upload, rows 32 apart.
export default function UploadDocumentsForm({ values, errors, onChange, onError }) {
    return (
        <section aria-label="Upload Documents" className="flex w-full flex-col gap-8 rounded-xl bg-white p-6">
            {DOCUMENTS_LIST.map((document) => (
                <DocumentRow
                    key={document.field}
                    {...document}
                    value={values[document.field]}
                    error={errors[document.field]}
                    onChange={(next) => onChange({ ...values, [document.field]: next }, document.field)}
                    onError={(message) => onError(document.field, message)}
                />
            ))}
        </section>
    );
}
