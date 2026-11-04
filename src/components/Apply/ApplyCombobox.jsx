"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";

import chevronDown from "@/assets/Apply/icons/chevron-down-16.svg";
import tagRemove from "@/assets/Apply/icons/tag-remove-13.svg";

// Searchable tag picker of the apply stages (Figma 1380:3452 skills). A text
// input drawn like the other fields with Figma's chevron; typing filters a
// suggestion list under the field. Free text is allowed, since no list can
// cover every skill.

const MAX_SUGGESTIONS = 8;

const boxClass =
    "h-[42px] w-full rounded-lg border text-sm leading-5 transition-colors outline-none pr-10 pl-[13px]";
const borderClass = (invalid) => (invalid ? "border-required" : "border-border-default focus:border-action");

const filterOptions = (options, query, exclude = []) => {
    const q = query.trim().toLowerCase();
    return options
        .filter((option) => !exclude.includes(option) && option.toLowerCase().includes(q))
        .slice(0, MAX_SUGGESTIONS);
};

// Keyboard and open/close handling shared by both comboboxes.
function useSuggestions({ suggestions, onPick }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const listId = useId();

    const show = open && suggestions.length > 0;

    const onKeyDown = (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((index) => Math.min(index + 1, suggestions.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, -1));
        } else if (event.key === "Escape") {
            setOpen(false);
            setActive(-1);
        } else if (event.key === "Enter" && show && active >= 0) {
            event.preventDefault();
            onPick(suggestions[active]);
            setActive(-1);
        }
    };

    const inputProps = {
        role: "combobox",
        "aria-expanded": show,
        "aria-controls": listId,
        "aria-autocomplete": "list",
        "aria-activedescendant": show && active >= 0 ? `${listId}-${active}` : undefined,
        onFocus: () => setOpen(true),
        onBlur: () => {
            setOpen(false);
            setActive(-1);
        },
        onKeyDown,
    };

    const list = show ? (
        <ul
            id={listId}
            role="listbox"
            className="absolute top-full right-0 left-0 z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-border-default bg-white py-1 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]"
        >
            {suggestions.map((option, index) => (
                <li
                    key={option}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === active}
                    // mousedown, so the pick happens before the input blurs.
                    onMouseDown={(event) => {
                        event.preventDefault();
                        onPick(option);
                        setActive(-1);
                    }}
                    onMouseEnter={() => setActive(index)}
                    className={`cursor-pointer px-[13px] py-2 text-sm leading-5 text-ink ${index === active ? "bg-surface-brand-subtle" : ""}`}
                >
                    {option}
                </li>
            ))}
        </ul>
    ) : null;

    return { inputProps, list, setOpen };
}

function Chevron({ onClick, disabled }) {
    return (
        <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            disabled={disabled}
            onMouseDown={(event) => {
                event.preventDefault();
                onClick();
            }}
            className="absolute top-1/2 right-[13px] flex -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed"
        >
            <Image src={chevronDown} alt="" width={16} height={16} />
        </button>
    );
}

// Figma 1919:5044 (skills) / 1380:3678 (certifications): entries show as
// removable field-height tags under the field (or above it, with `tagsAbove`). With a `max`, the field greys out at the
// limit ("Maximum skills reached") and the red limit line appears. Enter adds
// the typed text or the highlighted suggestion; Backspace on an empty field
// removes the last tag. `muted` draws Figma's grey #f9fafb field even below
// the limit, and `chevron={false}` hides the arrow (stage 4's certification
// field, where Figma's arrow layer is invisible).
export function ApplyTagPicker({
    id,
    value,
    onChange,
    options = [],
    max,
    placeholder,
    fullPlaceholder = "Maximum reached",
    limitMessage,
    listLabel = "Selected",
    muted = false,
    chevron = true,
    // Shows the tags above the field instead.
    tagsAbove = false,
    // Shows the tags beside the field on desktop (stage 4's skills, Figma 1878:21496).
    tagsBeside = false,
    // Figma's standalone pickers are 417 wide; inside a grid cell pass "".
    widthClassName = "lg:max-w-[417px]",
    invalid,
    describedBy,
}) {
    const inputRef = useRef(null);
    const [query, setQuery] = useState("");
    const full = max != null && value.length >= max;

    const suggestions = full ? [] : filterOptions(options, query, value);
    // `add` is passed in before it exists, so it goes through a wrapper.
    const { inputProps, list, setOpen } = useSuggestions({ suggestions, onPick: (skill) => add(skill) });

    const add = (skill) => {
        const clean = skill.trim();
        if (!clean || full || value.some((item) => item.toLowerCase() === clean.toLowerCase())) return;
        onChange([...value, clean]);
        setQuery("");
        // The field disables at the limit, and a disabled input never blurs,
        // so close the list here or it reopens when a tag is removed.
        if (max != null && value.length + 1 >= max) setOpen(false);
    };
    const remove = (skill) => onChange(value.filter((item) => item !== skill));

    const tags = value.length > 0 && (
        <ul aria-label={listLabel} className={`flex flex-wrap gap-3 ${tagsBeside ? "lg:min-w-0 lg:flex-1" : ""}`}>
            {value.map((skill) => (
                <li
                    key={skill}
                    className="flex h-[42px] items-center gap-2 rounded border border-[#0284c7] bg-white px-[13px] text-sm leading-[1.4] whitespace-nowrap text-[#0284c7] motion-safe:animate-[apply-check-in_200ms_ease-out_backwards]"
                >
                    {skill}
                    <button type="button" onClick={() => remove(skill)} aria-label={`Remove ${skill}`} className="cursor-pointer">
                        <Image src={tagRemove} alt="" width={13} height={13} />
                    </button>
                </li>
            ))}
        </ul>
    );

    return (
        <div className={tagsBeside ? "flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-6" : "flex flex-col gap-2"}>
            {tagsAbove && tags}
            <div className={`flex w-full flex-col gap-2 ${widthClassName} ${tagsBeside ? "lg:shrink-0" : ""}`}>
                <div className="relative w-full">
                    <input
                        suppressHydrationWarning
                        ref={inputRef}
                        id={id}
                        value={query}
                        disabled={full}
                        autoComplete="off"
                        placeholder={full ? fullPlaceholder : placeholder}
                        aria-invalid={invalid || undefined}
                        aria-describedby={describedBy}
                        onChange={(event) => setQuery(event.target.value)}
                        className={`${boxClass} ${borderClass(invalid)} text-ink ${
                            full
                                ? "cursor-not-allowed bg-[#f9fafb] placeholder:text-hint"
                                : muted
                                  ? "bg-[#f9fafb] placeholder:text-hint"
                                  : "bg-white placeholder:text-muted-ink"
                        }`}
                        {...inputProps}
                        onKeyDown={(event) => {
                            inputProps.onKeyDown(event);
                            if (event.defaultPrevented) return;
                            if (event.key === "Enter") {
                                event.preventDefault();
                                add(query);
                            } else if (event.key === "Backspace" && !query && value.length) {
                                remove(value[value.length - 1]);
                            }
                        }}
                    />
                    {chevron && <Chevron disabled={full} onClick={() => inputRef.current?.focus()} />}
                    {list}
                </div>

                {full && limitMessage && (
                    <p className="text-[11px] leading-[16.5px] font-bold text-[#ef4444] italic">{limitMessage}</p>
                )}
            </div>

            {!tagsAbove && tags}
        </div>
    );
}
