"use client";

import Image from "next/image";

import checkWhite from "@/assets/Apply/icons/check-white-16.svg";
import radioOff from "@/assets/Apply/icons/chip-radio-off-16.svg";
import radioOn from "@/assets/Apply/icons/chip-radio-on-16.svg";
import { messageIdFor } from "@/components/Apply/ApplyFormControls";

// Figma's choice chip: 12 padding, 12 radius. A single-answer chip shows a
// radio and turns light blue when picked; a multi-answer chip turns blue with
// a white check.
function Chip({ name, type, label, checked, onChange, first, invalid, describedBy }) {
    const multiple = type === "checkbox";
    return (
        <label
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl p-3 text-sm leading-[1.4] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${
                checked
                    ? multiple
                        ? "gap-1 bg-action text-white"
                        : "bg-[#d5e2f2] text-ink"
                    : "bg-[#f8f8f8] text-ink hover:bg-surface-brand-subtle"
            }`}
        >
            <input
                // The first chip takes the field id so the label and error focus reach it.
                id={first ? name : undefined}
                type={type}
                name={name}
                value={label}
                checked={checked}
                onChange={onChange}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                className="sr-only"
            />
            {multiple ? (
                checked && <Image src={checkWhite} alt="" width={16} height={16} />
            ) : (
                <Image src={checked ? radioOn : radioOff} alt="" width={16} height={16} />
            )}
            {label}
        </label>
    );
}

// A labelled row of chips (Figma 1878:20983 and its siblings): one answer,
// or several when `multiple` (an `exclusive` answer such as "Not Yet" clears
// the others, and picking another clears it).
export default function ChoiceField({
    field,
    label,
    options,
    value,
    multiple = false,
    exclusive,
    required = true,
    error,
    onChange,
    className = "",
}) {
    const describedBy = messageIdFor(field, { error });
    const selected = multiple ? (Array.isArray(value) ? value : []) : value;

    const toggle = (option) => {
        if (!multiple) return onChange(option);
        if (selected.includes(option)) return onChange(selected.filter((item) => item !== option));
        if (option === exclusive) return onChange([option]);
        onChange([...selected.filter((item) => item !== exclusive), option]);
    };

    return (
        <fieldset className={`flex min-w-0 flex-col gap-3 ${className}`}>
            <legend className="mb-3 text-base leading-[1.2] font-medium text-[#0b1c30]">
                {label}
                {required && <span className="text-[#d64545]"> *</span>}
            </legend>
            <div className="flex flex-wrap items-center gap-3">
                {options.map((option, index) => (
                    <Chip
                        key={option}
                        name={field}
                        type={multiple ? "checkbox" : "radio"}
                        label={option}
                        checked={multiple ? selected.includes(option) : selected === option}
                        onChange={() => toggle(option)}
                        first={index === 0}
                        invalid={Boolean(error)}
                        describedBy={describedBy}
                    />
                ))}
            </div>
            {error && (
                <p id={`${field}-message`} className="text-xs leading-[1.4] text-required">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
