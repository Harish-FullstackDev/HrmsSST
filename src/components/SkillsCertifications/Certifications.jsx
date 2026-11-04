"use client";

import { useState } from "react";
import Image from "next/image";

import workHistoryIcon from "@/assets/Apply/icons/work-history-22.svg";
import { ApplyFilePicker, FileChip } from "@/components/Apply/ApplyFilePicker";
import { ApplyField, ApplySelect, ApplyTextInput, messageIdFor } from "@/components/Apply/ApplyFormControls";
import { months, workYears } from "@/components/ExperienceEducation/experienceOptions";

const emptyCertificate = { name: "", provider: "", month: "", year: "", fileName: "" };

const REQUIRED = {
    name: "Enter the certification name.",
    provider: "Enter the issuing organization.",
    year: "Select the year of issue.",
};

// The month of issue is optional; without one, only the year is checked.
function validateCertificate(certificate) {
    const errors = {};
    for (const [field, message] of Object.entries(REQUIRED)) {
        if (!String(certificate[field] ?? "").trim()) errors[field] = message;
    }
    const now = new Date();
    const year = Number(certificate.year);
    const month = months.indexOf(certificate.month);
    const future = month >= 0 ? year * 12 + month > now.getFullYear() * 12 + now.getMonth() : year > now.getFullYear();
    if (!errors.year && future) errors.year = "The issue date can't be in the future.";
    return errors;
}

// Figma 1947:13309: one saved certification on a white bar (24 / 8 padding,
// 32 between columns of 360 / 240 / 120 / 200): name, provider, date, the
// attached file, and Edit / Delete.
function CertificateRow({ certificate, onEdit, onDelete }) {
    return (
        <li className="grid items-center gap-x-8 gap-y-2 rounded-xl bg-white px-6 py-2 text-sm leading-[1.4] text-ink-secondary md:grid-cols-[minmax(0,360fr)_minmax(0,240fr)_minmax(0,120fr)_minmax(0,200fr)_auto] motion-safe:animate-[apply-check-in_200ms_ease-out_backwards]">
            <span className="flex min-w-0 items-center gap-2">
                <span aria-hidden="true" className="h-[18px] w-[3px] shrink-0 rounded-[2px] bg-[#d9d9d9]" />
                <span className="flex size-[18px] shrink-0 items-end justify-center">
                    <Image src={workHistoryIcon} alt="" width={16} height={17} />
                </span>
                <span className="truncate text-base leading-[1.2] font-medium text-ink">{certificate.name}</span>
            </span>
            <span className="truncate">{certificate.provider}</span>
            <span>{[certificate.month, certificate.year].filter(Boolean).join(" ")}</span>
            <span>{certificate.fileName && <FileChip name={certificate.fileName} />}</span>
            <span className="flex items-center gap-2">
                <button type="button" onClick={onEdit} className="cursor-pointer px-3 py-2 text-muted-ink underline hover:text-ink">
                    Edit
                </button>
                <button type="button" onClick={onDelete} className="cursor-pointer px-3 py-2 text-[#b43838] underline hover:text-required">
                    Delete
                </button>
            </span>
        </li>
    );
}

// Only the file name is kept with the answers for now.
// TODO: upload the file once the backend takes certificates.
function CertificateFile({ fileName, error, onChange }) {
    return (
        <ApplyField id="certificate-file" label="Upload Your Certificate" error={error}>
            <ApplyFilePicker
                id="certificate-file"
                types={["pdf", "png", "jpg"]}
                fileName={fileName}
                invalid={Boolean(error)}
                describedBy={messageIdFor("certificate-file", { error })}
                onSubtle
                onPick={(file, problem) => onChange(file?.name ?? null, problem)}
            />
        </ApplyField>
    );
}

// Figma 1947:13334: the certification form on a grey panel, white fields.
function CertificateEditor({ initial, onSave, onCancel }) {
    const [certificate, setCertificate] = useState(initial);
    const [errors, setErrors] = useState({});

    const set = (field, value) => {
        setCertificate((current) => ({ ...current, [field]: value }));
        if (errors[field]) setErrors(({ [field]: _, ...rest }) => rest);
    };
    const control = (field) => ({
        id: `certificate-${field}`,
        name: field,
        value: certificate[field],
        invalid: Boolean(errors[field]),
        describedBy: messageIdFor(`certificate-${field}`, { error: errors[field] }),
        onSubtle: true,
    });
    const select = (field, options, placeholder) => (
        <ApplySelect
            {...control(field)}
            aria-label={placeholder}
            onChange={(event) => set(field, event.target.value)}
            options={options}
            placeholder={placeholder}
        />
    );

    const save = () => {
        const found = validateCertificate(certificate);
        setErrors(found);
        const first = Object.keys(found)[0];
        if (first) document.getElementById(`certificate-${first}`)?.focus();
        else onSave(certificate);
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl bg-[#f8f9fa] p-6 motion-safe:animate-[apply-check-in_200ms_ease-out_backwards]">
            <div className="grid gap-x-8 gap-y-2 lg:grid-cols-2">
                <ApplyField id="certificate-name" label="Name of the Certification" error={errors.name}>
                    <ApplyTextInput
                        {...control("name")}
                        onChange={(event) => set("name", event.target.value)}
                        placeholder="Ex “Enterprise Design Thinking Practitioner”"
                    />
                </ApplyField>
                <ApplyField id="certificate-provider" label="Issuing Organization / Provider" error={errors.provider}>
                    <ApplyTextInput
                        {...control("provider")}
                        onChange={(event) => set("provider", event.target.value)}
                        placeholder="Ex “IBM”"
                    />
                </ApplyField>
                <ApplyField id="certificate-year" label="Date of Issue" hint="Month is optional" error={errors.year}>
                    <div className="grid grid-cols-2 gap-3">
                        {select("month", months, "Month (optional)")}
                        {select("year", workYears, "Year")}
                    </div>
                </ApplyField>
                <CertificateFile
                    fileName={certificate.fileName}
                    error={errors.fileName}
                    onChange={(fileName, error) => {
                        if (error) setErrors((current) => ({ ...current, fileName: error }));
                        else set("fileName", fileName);
                    }}
                />
            </div>
            <div className="flex items-center justify-end gap-4">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="cursor-pointer px-3 py-3 text-sm leading-[1.4] text-ink-secondary hover:text-ink">
                        Cancel
                    </button>
                )}
                <button
                    type="button"
                    onClick={save}
                    className="cursor-pointer rounded-lg bg-action px-6 py-3 text-sm leading-[1.4] text-white transition-colors hover:bg-[#005192]"
                >
                    {initial === emptyCertificate ? "Add Certificate" : "Save Certificate"}
                </button>
            </div>
        </div>
    );
}

// Figma 1947:13305: the "Certifications" heading over a white card holding
// the saved certifications (rows with Edit / Delete on a grey panel), a
// divider, and the form to add one. The form starts open while none is
// saved; once one is added it closes to an "Add Another Certificate" button.
// `value` is the list.
export default function Certifications({ value, onChange }) {
    // null (adding a new one) or the index of the one being edited.
    const [editing, setEditing] = useState(null);
    const certificates = value ?? [];
    const [adding, setAdding] = useState(certificates.length === 0);
    const formOpen = editing !== null || adding || certificates.length === 0;

    const save = (certificate) => {
        onChange(
            editing === null ? [...certificates, certificate] : certificates.map((item, i) => (i === editing ? certificate : item)),
        );
        setEditing(null);
        setAdding(false);
    };

    return (
        <section aria-labelledby="certifications-title" className="flex flex-col gap-8">
            <h2 id="certifications-title" className="text-base leading-[1.2] font-medium text-[#374151]">
                Certifications
            </h2>
            <div className="flex flex-col gap-8 rounded-xl bg-white p-6">
                {/* Hidden while the only saved one is open in the form. */}
                {certificates.some((_, index) => index !== editing) && (
                    <>
                        <ul aria-label="Added certifications" className="flex flex-col gap-6 rounded-xl bg-[#f8f9fa] p-6">
                            {certificates.map((certificate, index) =>
                                editing === index ? null : (
                                    <CertificateRow
                                        key={`${certificate.name}-${index}`}
                                        certificate={certificate}
                                        onEdit={() => {
                                            setEditing(index);
                                            setAdding(false);
                                        }}
                                        onDelete={() => {
                                            onChange(certificates.filter((_, i) => i !== index));
                                            setEditing(null);
                                        }}
                                    />
                                ),
                            )}
                        </ul>
                        {formOpen && <hr className="border-border-default" />}
                    </>
                )}
                {formOpen ? (
                    <CertificateEditor
                        key={editing ?? `new-${certificates.length}`}
                        initial={editing === null ? emptyCertificate : certificates[editing]}
                        onSave={save}
                        // Nothing to go back to while the list is empty.
                        onCancel={
                            certificates.length === 0
                                ? null
                                : () => {
                                      setEditing(null);
                                      setAdding(false);
                                  }
                        }
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="cursor-pointer self-start rounded-lg border border-action px-6 py-3 text-sm leading-[1.4] text-action transition-colors hover:bg-surface-brand-subtle"
                    >
                        + Add Another Certificate
                    </button>
                )}
            </div>
        </section>
    );
}
