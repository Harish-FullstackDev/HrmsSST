"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import arrowLeftIcon from "@/assets/HrJobForm/icons/arrow-left-16.svg";
import chevronIcon from "@/assets/HrJobForm/icons/chevron-down-16.svg";
import dragIcon from "@/assets/HrJobForm/icons/drag-16.svg";
import minusIcon from "@/assets/HrJobForm/icons/minus-12.svg";
import plusSmallIcon from "@/assets/HrJobForm/icons/plus-12.svg";
import plusIcon from "@/assets/HrJobForm/icons/plus-16.svg";
import trashIcon from "@/assets/HrJobForm/icons/trash-16.svg";
import { ApplyTagPicker } from "@/components/Apply/ApplyCombobox";
import ChoiceField from "@/components/ExperienceEducation/ChoiceField";
import { skills as skillOptions } from "@/components/ExperienceEducation/experienceOptions";
import { previewNextJobCode, saveJob } from "@/lib/jobs/actions";
import {
    DEPARTMENTS,
    EMPLOYMENT_TYPES,
    EXPERIENCE_LEVELS,
    MAX_JOB_SKILLS,
    MAX_LIST_ITEMS,
    MAX_OPENINGS,
    WORK_MODES,
    capitalizeFirst,
    emptyJob,
    todayIso,
    validateJob,
} from "@/lib/jobs/jobForm";

// Figma "Add Job Form": 34-tall grey fields with an 8 radius, 16px medium
// labels 12 above them; the error line sits under each field.
const inputClass = (invalid) =>
    `h-[34px] w-full rounded-lg border bg-[#f8f9fa] px-[13px] text-sm leading-5 text-ink outline-none transition-colors placeholder:text-ink-disabled focus:border-action ${
        invalid ? "border-required" : "border-border-default"
    }`;

function Label({ htmlFor, required, children, as: Tag = "label" }) {
    return (
        <Tag htmlFor={Tag === "label" ? htmlFor : undefined} className="text-base leading-[1.2] font-medium text-[#374151]">
            {children}
            {required && <span className="text-[#ef4444]"> *</span>}
        </Tag>
    );
}

function ErrorLine({ id, error }) {
    return error ? (
        <p id={`${id}-message`} className="text-xs leading-[1.4] text-required">
            {error}
        </p>
    ) : null;
}

function Field({ id, label, required, error, className = "", children }) {
    return (
        <div className={`flex min-w-0 flex-col gap-3 ${className}`}>
            <Label htmlFor={id} required={required}>
                {label}
            </Label>
            {children}
            <ErrorLine id={id} error={error} />
        </div>
    );
}

// The openings stepper: minus, the number, plus, in one bordered box.
function Stepper({ id, value, onChange, invalid }) {
    const number = Number.parseInt(value, 10) || 1;
    const step = "flex w-[33px] items-center justify-center transition-colors hover:bg-neutral-100 disabled:opacity-40";
    return (
        <div
            className={`flex h-[33px] w-[99px] overflow-hidden rounded-lg border bg-white ${invalid ? "border-required" : "border-[#cbd5e1]"}`}
        >
            <button type="button" aria-label="Fewer openings" disabled={number <= 1} onClick={() => onChange(number - 1)} className={step}>
                <Image src={minusIcon} alt="" width={12} height={12} />
            </button>
            <input
                id={id}
                inputMode="numeric"
                value={value}
                onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 3))}
                onBlur={() => onChange(Math.min(MAX_OPENINGS, Math.max(1, number)))}
                aria-invalid={invalid || undefined}
                className="w-[33px] border-x border-[#cbd5e1] text-center text-sm text-[#0f172a] outline-none focus:bg-surface-brand-subtle"
            />
            <button
                type="button"
                aria-label="More openings"
                disabled={number >= MAX_OPENINGS}
                onClick={() => onChange(number + 1)}
                className={step}
            >
                <Image src={plusSmallIcon} alt="" width={12} height={12} />
            </button>
        </div>
    );
}

// An ordered list of one-line entries (responsibilities, qualifications):
// each row has a drag handle, the field and a delete button; "Add …" adds an
// empty row. Rows reorder by dragging the handle, or with the arrow keys on
// it. The last row can't be deleted, only emptied.
function ListField({ id, label, addLabel, value, onChange, error }) {
    const [dragFrom, setDragFrom] = useState(null);
    const [armed, setArmed] = useState(null);

    const move = (from, to) => {
        if (to < 0 || to >= value.length || from === to) return;
        const next = [...value];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        onChange(next);
    };

    return (
        <fieldset className="flex min-w-0 flex-col gap-3">
            <Label as="legend" required>
                {label}
            </Label>
            <ol className="mt-3 flex flex-col gap-3">
                {value.map((item, index) => (
                    <li
                        key={index}
                        draggable={armed === index}
                        onDragStart={() => setDragFrom(index)}
                        onDragOver={(event) => dragFrom !== null && event.preventDefault()}
                        onDrop={() => {
                            move(dragFrom, index);
                            setDragFrom(null);
                        }}
                        onDragEnd={() => {
                            setDragFrom(null);
                            setArmed(null);
                        }}
                        className={`flex items-center gap-3 ${dragFrom === index ? "opacity-50" : ""}`}
                    >
                        <button
                            type="button"
                            aria-label={`Move ${label.toLowerCase()} ${index + 1} (arrow keys)`}
                            onPointerDown={() => setArmed(index)}
                            onPointerUp={() => setArmed(null)}
                            onKeyDown={(event) => {
                                if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                                    event.preventDefault();
                                    move(index, index + (event.key === "ArrowUp" ? -1 : 1));
                                }
                            }}
                            className="flex size-[18px] shrink-0 cursor-grab items-center justify-center rounded active:cursor-grabbing"
                        >
                            <Image src={dragIcon} alt="" width={16} height={16} />
                        </button>
                        <input
                            id={index === 0 ? id : undefined}
                            value={item}
                            maxLength={300}
                            onChange={(event) => onChange(value.map((entry, i) => (i === index ? capitalizeFirst(event.target.value) : entry)))}
                            aria-label={`${label} ${index + 1}`}
                            aria-invalid={Boolean(error) || undefined}
                            aria-describedby={error ? `${id}-message` : undefined}
                            className={inputClass(Boolean(error) && !item.trim())}
                        />
                        <button
                            type="button"
                            aria-label={`Delete ${label.toLowerCase()} ${index + 1}`}
                            onClick={() => onChange(value.length > 1 ? value.filter((_, i) => i !== index) : [""])}
                            className="flex size-[18px] shrink-0 items-center justify-center rounded hover:bg-error-100"
                        >
                            <Image src={trashIcon} alt="" width={16} height={16} />
                        </button>
                    </li>
                ))}
            </ol>
            {value.length < MAX_LIST_ITEMS && (
                <button
                    type="button"
                    onClick={() => onChange([...value, ""])}
                    className="flex items-center gap-3 self-start rounded text-sm leading-[1.4] text-action hover:underline"
                >
                    <Image src={plusIcon} alt="" width={16} height={16} />
                    {addLabel}
                </button>
            )}
            <ErrorLine id={id} error={error} />
        </fieldset>
    );
}

// Figma "Add Job Form": create a job, or edit one (`jobId`, `jobCode`, its
// current `status` and `initial` values). Three columns on desktop: the ID,
// title and department, then the employment type, work mode and openings;
// under them the summary, duties and qualifications across two columns beside
// the location, closing date, experience and skills. Save as Draft needs only
// a title; Publish checks everything and puts the job on the careers pages.
// Shown in JobFormDialog: Back calls `onCancel`, a save calls `onSaved`, and
// `dirtyRef` tells the dialog whether there are unsaved changes.
// `heading` overrides the title ("Duplicate ASC-2026-001").
export default function JobForm({ jobId, jobCode, status, heading, initial = emptyJob, onCancel, onSaved, dirtyRef }) {
    const [values, setValues] = useState(initial);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(null); // "draft" | "publish" | null
    const [formError, setFormError] = useState("");
    const published = status === "published";

    // A new job (create or duplicate) shows the ID it will get when saved.
    // Only a preview: the database assigns the real one on insert.
    const [nextCode, setNextCode] = useState("");
    useEffect(() => {
        if (jobCode) return;
        let cancelled = false;
        previewNextJobCode()
            .then((result) => !cancelled && result.ok && setNextCode(result.code))
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [jobCode]);

    const dirty = JSON.stringify(values) !== JSON.stringify(initial);
    useEffect(() => {
        if (dirtyRef) dirtyRef.current = dirty;
    }, [dirty, dirtyRef]);

    const set = (field) => (value) => {
        setValues((current) => ({ ...current, [field]: value }));
        if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
    };

    // Moves focus to the first field with an error (in the form's order).
    const focusFirstError = (found) => {
        const first = Object.keys(emptyJob).find((field) => found[field]);
        document.getElementById(first)?.focus();
    };

    const save = async (publish) => {
        if (saving) return;
        // Taking a live job off the careers pages deserves a check.
        if (!publish && published && !window.confirm("Save as draft? The job will be taken off the careers pages until you publish it again.")) {
            return;
        }
        setFormError("");
        const found = validateJob(values, { publish, today: todayIso() });
        setErrors(found);
        if (Object.keys(found).length > 0) {
            setFormError(publish ? "Please fix the highlighted fields before publishing." : "");
            focusFirstError(found);
            return;
        }

        setSaving(publish ? "publish" : "draft");
        let result;
        try {
            result = await saveJob({ id: jobId, values, publish });
        } catch {
            result = { ok: false, error: "The job couldn't be saved. Check your connection and try again." };
        }
        if (!result.ok) {
            setSaving(null);
            if (result.errors) {
                setErrors(result.errors);
                focusFirstError(result.errors);
            }
            setFormError(result.error ?? "Please fix the highlighted fields.");
            return;
        }
        onSaved?.();
    };

    return (
        <form
            noValidate
            aria-labelledby="job-form-title"
            onSubmit={(event) => {
                event.preventDefault();
                save(true);
            }}
            className="flex flex-col gap-8 p-6"
        >
            <h2 id="job-form-title" className="text-base leading-[1.2] font-medium text-ink">
                {heading ?? (jobId ? "Edit Job" : "Create Job")}
            </h2>

            <div className="grid gap-x-[33px] gap-y-8 lg:grid-cols-3">
                <Field id="jobCode" label="Job ID">
                    <input
                        id="jobCode"
                        readOnly
                        value={jobCode ?? nextCode}
                        placeholder="Assigned when saved"
                        className="h-[34px] w-full rounded-lg border border-border-default bg-surface-brand-subtle px-[13px] text-sm text-border-strong outline-none placeholder:text-border-strong"
                    />
                </Field>
                <Field id="title" label="Job Title" required error={errors.title}>
                    <input
                        id="title"
                        value={values.title}
                        maxLength={120}
                        onChange={(event) => set("title")(capitalizeFirst(event.target.value))}
                        placeholder="e.g. Graphic Designer"
                        aria-invalid={Boolean(errors.title) || undefined}
                        aria-describedby={errors.title ? "title-message" : undefined}
                        className={inputClass(errors.title)}
                    />
                </Field>
                <Field id="department" label="Department" required error={errors.department}>
                    <div className="relative">
                        <select
                            id="department"
                            value={values.department}
                            onChange={(event) => set("department")(event.target.value)}
                            aria-invalid={Boolean(errors.department) || undefined}
                            aria-describedby={errors.department ? "department-message" : undefined}
                            className={`${inputClass(errors.department)} cursor-pointer appearance-none pr-10 ${values.department ? "" : "text-ink-disabled"}`}
                        >
                            <option value="" disabled>
                                Select a department
                            </option>
                            {DEPARTMENTS.map((department) => (
                                <option key={department} value={department} className="text-ink">
                                    {department}
                                </option>
                            ))}
                        </select>
                        <Image
                            src={chevronIcon}
                            alt=""
                            width={16}
                            height={16}
                            className="pointer-events-none absolute top-1/2 right-[13px] -translate-y-1/2"
                        />
                    </div>
                </Field>

                <ChoiceField
                    field="employmentType"
                    label="Employment Type"
                    options={EMPLOYMENT_TYPES}
                    value={values.employmentType}
                    error={errors.employmentType}
                    onChange={set("employmentType")}
                />
                <ChoiceField
                    field="workMode"
                    label="Work Mode"
                    options={WORK_MODES}
                    value={values.workMode}
                    error={errors.workMode}
                    onChange={set("workMode")}
                />
                <div className="flex flex-col gap-2 lg:justify-center">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="openings" required>
                            No. of Openings
                        </Label>
                        <Stepper id="openings" value={values.openings} onChange={set("openings")} invalid={Boolean(errors.openings)} />
                    </div>
                    <ErrorLine id="openings" error={errors.openings} />
                </div>

                <div className="flex flex-col gap-8 lg:col-span-2">
                    <Field id="summary" label="Job Summary" required error={errors.summary}>
                        <textarea
                            id="summary"
                            rows={2}
                            value={values.summary}
                            maxLength={3000}
                            onChange={(event) => set("summary")(capitalizeFirst(event.target.value))}
                            placeholder="What the role is about, in a few sentences."
                            aria-invalid={Boolean(errors.summary) || undefined}
                            aria-describedby={errors.summary ? "summary-message" : undefined}
                            className={`${inputClass(errors.summary)} h-auto min-h-[54px] resize-y py-2`}
                        />
                    </Field>
                    <ListField
                        id="responsibilities"
                        label="Roles and Responsibilities"
                        addLabel="Add Roles & Responsibility"
                        value={values.responsibilities}
                        onChange={set("responsibilities")}
                        error={errors.responsibilities}
                    />
                    <ListField
                        id="qualifications"
                        label="Qualifications"
                        addLabel="Add Qualification"
                        value={values.qualifications}
                        onChange={set("qualifications")}
                        error={errors.qualifications}
                    />
                </div>

                <div className="flex flex-col gap-8">
                    <Field id="location" label="Location" required error={errors.location}>
                        <input
                            id="location"
                            value={values.location}
                            maxLength={120}
                            onChange={(event) => set("location")(capitalizeFirst(event.target.value))}
                            placeholder="e.g. Puducherry, India"
                            aria-invalid={Boolean(errors.location) || undefined}
                            aria-describedby={errors.location ? "location-message" : undefined}
                            className={inputClass(errors.location)}
                        />
                    </Field>
                    <Field id="closingDate" label="Closing Date" required error={errors.closingDate}>
                        <input
                            id="closingDate"
                            type="date"
                            value={values.closingDate}
                            onChange={(event) => set("closingDate")(event.target.value)}
                            aria-invalid={Boolean(errors.closingDate) || undefined}
                            aria-describedby={errors.closingDate ? "closingDate-message" : undefined}
                            className={inputClass(errors.closingDate)}
                        />
                    </Field>
                    <ChoiceField
                        field="experienceLevel"
                        label="Experience Level"
                        options={EXPERIENCE_LEVELS}
                        value={values.experienceLevel}
                        error={errors.experienceLevel}
                        onChange={set("experienceLevel")}
                    />
                    {values.experienceLevel === "Experienced" && (
                        <Field id="minYears" label="Minimum Years of Experience" required error={errors.minYears}>
                            <input
                                id="minYears"
                                inputMode="numeric"
                                value={values.minYears}
                                onChange={(event) => set("minYears")(event.target.value.replace(/\D/g, "").slice(0, 2))}
                                placeholder="e.g. 2"
                                aria-invalid={Boolean(errors.minYears) || undefined}
                                aria-describedby={errors.minYears ? "minYears-message" : undefined}
                                className={inputClass(errors.minYears)}
                            />
                        </Field>
                    )}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="skills" required>
                            Skills
                        </Label>
                        <ApplyTagPicker
                            id="skills"
                            value={values.skills}
                            onChange={set("skills")}
                            options={skillOptions}
                            max={MAX_JOB_SKILLS}
                            placeholder="Search or add a skill"
                            fullPlaceholder="Maximum skills reached"
                            listLabel="Selected skills"
                            widthClassName=""
                            muted
                            invalid={Boolean(errors.skills)}
                            describedBy={errors.skills ? "skills-message" : undefined}
                        />
                        <ErrorLine id="skills" error={errors.skills} />
                    </div>
                </div>
            </div>

            {formError && (
                <p role="alert" className="rounded-lg border border-required bg-[#fdf2f2] px-4 py-3 text-sm leading-5 text-required">
                    {formError}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={Boolean(saving)}
                    className="flex h-[31px] items-center gap-2 rounded-lg bg-surface-brand-subtle px-3.5 text-base leading-[1.2] text-ink transition-colors hover:bg-primary-100 disabled:opacity-60"
                >
                    <Image src={arrowLeftIcon} alt="" width={16} height={16} />
                    Back
                </button>
                <div className="flex items-center gap-9">
                    <button
                        type="button"
                        onClick={() => save(false)}
                        disabled={Boolean(saving)}
                        className="text-base leading-[1.2] text-ink-secondary transition-colors hover:text-ink disabled:opacity-60"
                    >
                        {saving === "draft" ? "Saving…" : published ? "Unpublish & Save as Draft" : "Save as Draft"}
                    </button>
                    <button
                        type="submit"
                        disabled={Boolean(saving) || (published && !dirty)}
                        className="flex h-[31px] items-center rounded-lg bg-action px-3 text-base leading-[1.2] text-white transition-colors hover:bg-primary disabled:opacity-60"
                    >
                        {saving === "publish" ? "Saving…" : published ? "Save Changes" : "Publish"}
                    </button>
                </div>
            </div>
        </form>
    );
}
