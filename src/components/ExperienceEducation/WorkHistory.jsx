"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import workHistoryIcon from "@/assets/Apply/icons/work-history-22.svg";
import { ApplyField, ApplySelect, ApplyTextInput, messageIdFor } from "@/components/Apply/ApplyFormControls";
import ChoiceField from "@/components/ExperienceEducation/ChoiceField";
import { months, workYears, yesNo } from "@/components/ExperienceEducation/experienceOptions";
import { capitalizeFirst } from "@/lib/jobs/jobForm";

const emptyRole = {
    jobTitle: "",
    organization: "",
    location: "",
    current: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
};

const REQUIRED = {
    jobTitle: "Enter your job title.",
    organization: "Enter the organization.",
    location: "Enter the location.",
    current: "Select an option.",
    startMonth: "Select the start month.",
    startYear: "Select the start year.",
    endMonth: "Select the end month.",
    endYear: "Select the end year.",
};

const TEXT_FIELDS = ["jobTitle", "organization", "location"];
const MAX_TEXT = 100;
// The date fields, whose errors depend on one another.
const DATE_FIELDS = ["current", "startMonth", "startYear", "endMonth", "endYear"];

// Month index from the year and month, to compare dates.
const monthIndex = (year, month) => Number(year) * 12 + months.indexOf(month);

const sameText = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Returns { field: message } for every invalid field. `others` are the other
// saved roles, to catch the same role added twice.
function validateRole(role, others) {
    const errors = {};
    const fields = Object.keys(REQUIRED).filter((field) => role.current !== "Yes" || !field.startsWith("end"));
    for (const field of fields) {
        if (!String(role[field] ?? "").trim()) errors[field] = REQUIRED[field];
    }
    for (const field of TEXT_FIELDS) {
        const value = role[field].trim();
        if (errors[field]) continue;
        if (value.length < 2) errors[field] = "Enter at least 2 characters.";
        else if (!/\p{L}/u.test(value)) errors[field] = "Use letters, not only numbers or symbols.";
    }

    const now = new Date();
    const thisMonth = now.getFullYear() * 12 + now.getMonth();
    const startKnown = !errors.startMonth && !errors.startYear;
    const endKnown = role.current !== "Yes" && !errors.endMonth && !errors.endYear;
    const start = monthIndex(role.startYear, role.startMonth);
    const end = monthIndex(role.endYear, role.endMonth);
    if (startKnown && start > thisMonth) errors.startMonth = "The start can't be in the future.";
    if (endKnown && end > thisMonth) {
        errors.endMonth = "The end can't be in the future. Choose Yes for Current Employment instead.";
    } else if (endKnown && !errors.startMonth && startKnown && end < start) {
        errors.endMonth = "The end must be after the start.";
    }

    if (
        !errors.jobTitle &&
        !errors.organization &&
        startKnown &&
        others.some(
            (other) =>
                sameText(other.jobTitle, role.jobTitle) &&
                sameText(other.organization, role.organization) &&
                other.startMonth === role.startMonth &&
                other.startYear === role.startYear,
        )
    ) {
        errors.jobTitle = "You've already added this role.";
    }
    return errors;
}

// "March 2025 - October 2026", or "- Present" for the current role.
export const roleDates = (role) =>
    `${role.startMonth} ${role.startYear} - ${role.current === "Yes" ? "Present" : `${role.endMonth} ${role.endYear}`}`;

// Figma 1947:12370: one saved role on a white bar (24 / 8 padding, columns of
// 256 / 256 / 200 / 240 spread across), with Edit / Delete.
function RoleRow({ role, onEdit, onDelete }) {
    return (
        <li className="grid items-center gap-x-6 gap-y-2 rounded-xl bg-white px-6 py-2 text-sm leading-[1.4] text-ink-secondary md:grid-cols-[minmax(0,256fr)_minmax(0,256fr)_minmax(0,200fr)_minmax(0,240fr)_auto] motion-safe:animate-[apply-check-in_200ms_ease-out_backwards]">
            <span className="flex min-w-0 items-center gap-2">
                <span aria-hidden="true" className="h-[18px] w-[3px] shrink-0 rounded-[2px] bg-[#d9d9d9]" />
                <span className="flex size-[18px] shrink-0 items-end justify-center">
                    <Image src={workHistoryIcon} alt="" width={16} height={17} />
                </span>
                <span className="truncate text-base leading-[1.2] font-medium text-ink">{role.jobTitle}</span>
            </span>
            <span className="truncate">{role.organization}</span>
            <span className="truncate">{role.location}</span>
            <span>{roleDates(role)}</span>
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

// Figma 1947:12263: the role form on a grey panel, white fields. End
// month/year hide while Current Employment is Yes.
function RoleEditor({ initial, others, autoFocus, onSave, onCancel }) {
    const [role, setRole] = useState(initial);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (autoFocus) document.getElementById("role-jobTitle")?.focus();
    }, [autoFocus]);

    // Changing any date clears every date error, as they compare each other.
    const set = (field, value) => {
        setRole((current) => ({ ...current, [field]: value }));
        const cleared = DATE_FIELDS.includes(field) ? DATE_FIELDS : [field];
        setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !cleared.includes(key))));
    };
    const control = (field) => ({
        id: `role-${field}`,
        name: field,
        value: role[field],
        invalid: Boolean(errors[field]),
        describedBy: messageIdFor(`role-${field}`, { error: errors[field] }),
        onSubtle: true,
    });
    const text = (field, label, placeholder) => (
        <ApplyField id={`role-${field}`} label={label} required error={errors[field]}>
            <ApplyTextInput
                {...control(field)}
                // Job title, organization and location start with a capital.
                onChange={(event) => set(field, capitalizeFirst(event.target.value))}
                placeholder={placeholder}
                maxLength={MAX_TEXT}
            />
        </ApplyField>
    );
    const select = (field, label, options, placeholder) => (
        <ApplyField id={`role-${field}`} label={label} required error={errors[field]}>
            <ApplySelect
                {...control(field)}
                onChange={(event) => set(field, event.target.value)}
                options={options}
                placeholder={placeholder}
            />
        </ApplyField>
    );

    const save = () => {
        const found = validateRole(role, others);
        setErrors(found);
        // Focus the first invalid field in form order.
        const first = Object.keys(REQUIRED).find((field) => found[field]);
        if (first) {
            document.getElementById(`role-${first}`)?.focus();
            return;
        }
        const trimmed = { ...role, ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, role[field].trim()])) };
        onSave(role.current === "Yes" ? { ...trimmed, endMonth: "", endYear: "" } : trimmed);
    };

    return (
        <div className="flex flex-col gap-6 rounded-xl bg-[#f8f9fa] p-6 motion-safe:animate-[apply-check-in_200ms_ease-out_backwards]">
            <div className="grid gap-x-8 gap-y-2 lg:grid-cols-3">
                {text("jobTitle", "Job Title", "Ex: Product Designer")}
                {text("organization", "Organization", "Ex: Support Studio Technologies")}
                {text("location", "Location", "Ex: Puducherry, India")}
            </div>
            <div className="grid gap-x-8 gap-y-4 lg:grid-cols-3">
                <ChoiceField
                    field="role-current"
                    label="Current Employment"
                    options={yesNo}
                    value={role.current}
                    error={errors.current}
                    onChange={(value) => set("current", value)}
                />
                <div className="grid grid-cols-2 gap-x-8">
                    {select("startMonth", "Start Month", months, "Month")}
                    {select("startYear", "Start Year", workYears, "Year")}
                </div>
                {role.current !== "Yes" && (
                    <div className="grid grid-cols-2 gap-x-8">
                        {select("endMonth", "End Month", months, "Month")}
                        {select("endYear", "End Year", workYears, "Year")}
                    </div>
                )}
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
                    {initial === emptyRole ? "Add Experience" : "Save Experience"}
                </button>
            </div>
        </div>
    );
}

// Figma 1947:12254: the candidate's roles. The role form is open until the
// first role is saved; after that the saved roles list as white rows with
// Edit / Delete on a grey panel, with an Add Another Role button that opens
// the form again, then a divider. `value` is the list of roles.
export default function WorkHistory({ value, error, onChange }) {
    // null or the index of the role being edited.
    const [editing, setEditing] = useState(null);
    // Whether Add Another Role has opened the form.
    const [adding, setAdding] = useState(false);
    const roles = value ?? [];
    const formOpen = roles.length === 0 || adding || editing !== null;

    const close = () => {
        setEditing(null);
        setAdding(false);
    };
    const save = (role) => {
        onChange(editing === null ? [...roles, role] : roles.map((item, i) => (i === editing ? role : item)));
        close();
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Hidden while the only saved role is open in the form. */}
            {roles.some((_, index) => index !== editing) && (
                <div className="flex flex-col gap-6 rounded-xl bg-[#f8f9fa] p-6">
                    <ul aria-label="Work experience" className="flex flex-col gap-6">
                        {roles.map((role, index) =>
                            editing === index ? null : (
                                <RoleRow
                                    key={`${role.jobTitle}-${role.organization}-${index}`}
                                    role={role}
                                    onEdit={() => {
                                        setAdding(false);
                                        setEditing(index);
                                    }}
                                    onDelete={() => {
                                        onChange(roles.filter((_, i) => i !== index));
                                        close();
                                    }}
                                />
                            ),
                        )}
                    </ul>
                    {!formOpen && (
                        <button
                            type="button"
                            onClick={() => setAdding(true)}
                            className="cursor-pointer self-end rounded-lg bg-action px-6 py-3 text-sm leading-[1.4] text-white transition-colors hover:bg-[#005192] motion-safe:animate-[apply-check-in_200ms_ease-out_backwards]"
                        >
                            Add Another Role
                        </button>
                    )}
                </div>
            )}

            {formOpen && (
                <RoleEditor
                    key={editing ?? `new-${roles.length}`}
                    initial={editing === null ? emptyRole : roles[editing]}
                    others={roles.filter((_, index) => index !== editing)}
                    // Opened by the candidate, so start typing straight away.
                    autoFocus={roles.length > 0}
                    onSave={save}
                    onCancel={roles.length === 0 ? null : close}
                />
            )}

            {roles.length > 0 && <hr className="border-border-default" />}

            {error && (
                <p id="workHistory-message" role="alert" className="text-xs leading-[1.4] text-required">
                    {error}
                </p>
            )}
        </div>
    );
}
