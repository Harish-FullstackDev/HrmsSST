"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";

import chevronDown from "@/assets/Apply/icons/chevron-down-16.svg";
import chevronLight from "@/assets/Apply/icons/chevron-down-light-16.svg";

// Form building blocks of the apply stages (Figma 1380:3211 onwards).
// A field is an 18px label, 12 gap, a 42-tall input, then a 21-tall slot
// (4 + one 12px line) for the hint or the error. The slot is always there, so
// every field is 97 tall and the rows line up as in Figma.
//
// The hint/error line has the id `${id}-message`; pass it to the control as
// `describedBy` (see `messageIdFor`) so screen readers read it.
//
// Inputs carry suppressHydrationWarning for the same reason as the auth
// controls: autofill extensions add attributes before React hydrates.

// Figma 1878:19631: empty fields are grey (#f8f9fa) with a light placeholder;
// filled ones turn light blue. On a grey panel (`onSubtle`, Figma 1947:13334)
// empty fields are white instead.
const boxClass = "h-[42px] w-full rounded-lg border text-sm leading-5 transition-colors outline-none";
const borderClass = (invalid) => (invalid ? "border-required" : "border-border-default");
export const fillClass = (value, onSubtle = false) =>
    value ? "bg-surface-brand-subtle" : onSubtle ? "bg-white" : "bg-[#f8f9fa]";

export const messageIdFor = (id, { hint, error } = {}) => (hint || error ? `${id}-message` : undefined);

export function ApplyField({ id, label, required = false, hint, error, className = "", children }) {
    const messageId = `${id}-message`;
    return (
        <div className={`relative flex min-w-0 flex-col has-[[aria-expanded=true]]:z-30 ${className}`}>
            <label htmlFor={id} className="text-base leading-[1.2] font-medium text-[#374151]">
                {label}
                {required && <span className="text-[#ef4444]"> *</span>}
            </label>
            <div className="mt-3">{children}</div>
            <p
                id={messageId}
                className={`mt-1 min-h-[17px] text-xs leading-[1.4] ${error ? "text-required" : "font-light text-[#6b7280] italic"}`}
            >
                {error || hint}
            </p>
        </div>
    );
}

export function ApplyTextInput({ invalid, describedBy, onSubtle, ...props }) {
    return (
        <input
            suppressHydrationWarning
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            // A read-only field (the locked email) is greyed and keeps its border on focus.
            className={`${boxClass} ${borderClass(invalid)} ${fillClass(props.value, onSubtle)} px-[13px] text-ink placeholder:text-ink-disabled focus:border-action read-only:cursor-not-allowed read-only:bg-neutral-100 read-only:text-ink-secondary read-only:focus:border-border-default`}
            {...props}
        />
    );
}

// Dropdown drawn like the inputs, with Figma's chevron 13 from the right.
// Not a native select: the browser opens a native list above the field when
// space below is short and lays it over the field, so this list always opens
// under the field (scrolling the page to show it). The placeholder shows in
// the muted colour until something is picked. Keyboard: arrows, Home/End,
// Enter/Space to pick, Escape to close, letters jump to a match.
// `onChange` receives { target: { name, value } } like a native change event.
// `icon` swaps the chevron (the language and fluency pickers use a lighter one).
export function ApplySelect({
    id,
    name,
    invalid,
    describedBy,
    placeholder,
    options,
    value,
    onChange,
    disabled = false,
    icon = chevronDown,
    onSubtle = false,
    "aria-label": ariaLabel,
}) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const buttonRef = useRef(null);
    const listRef = useRef(null);
    const typed = useRef({ text: "", at: 0 });
    const listId = useId();
    const selected = options.indexOf(value);

    const openList = () => {
        if (disabled) return;
        setActive(Math.max(selected, 0));
        setOpen(true);
    };
    const close = () => {
        setOpen(false);
        setActive(-1);
    };
    const pick = (option) => {
        if (option !== value) onChange?.({ target: { name, value: option } });
        close();
        buttonRef.current?.focus();
    };

    // Bring the list on screen when it opens, then keep the active option in it.
    useEffect(() => {
        if (open) listRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, [open]);
    useEffect(() => {
        if (open && active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
    }, [open, active]);

    // Letters typed within half a second build a prefix to jump to.
    const jumpTo = (key) => {
        const now = Date.now();
        typed.current = { text: (now - typed.current.at < 500 ? typed.current.text : "") + key.toLowerCase(), at: now };
        const match = options.findIndex((option) => option.toLowerCase().startsWith(typed.current.text));
        if (match >= 0) {
            setOpen(true);
            setActive(match);
        }
    };

    const onKeyDown = (event) => {
        const last = options.length - 1;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) return openList();
            const step = event.key === "ArrowDown" ? 1 : -1;
            setActive((index) => Math.min(Math.max(index + step, 0), last));
        } else if (open && (event.key === "Home" || event.key === "End")) {
            event.preventDefault();
            setActive(event.key === "Home" ? 0 : last);
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (open && active >= 0) pick(options[active]);
            else openList();
        } else if (event.key === "Escape" && open) {
            event.preventDefault();
            close();
        } else if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
            jumpTo(event.key);
        }
    };

    return (
        <div
            className="relative"
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) close();
            }}
        >
            <button
                suppressHydrationWarning
                ref={buttonRef}
                type="button"
                id={id}
                name={name}
                disabled={disabled}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
                aria-label={ariaLabel}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                onClick={() => (open ? close() : openList())}
                onKeyDown={onKeyDown}
                className={`flex h-[42px] w-full items-center rounded-lg border pr-10 pl-[13px] text-left text-sm leading-5 transition-colors outline-none ${
                    open ? "border-action" : `${borderClass(invalid)} focus:border-action`
                } ${disabled ? "cursor-not-allowed bg-neutral-100" : `cursor-pointer ${fillClass(value, onSubtle)}`} ${
                    value ? "text-ink" : "text-ink-disabled"
                }`}
            >
                <span className="truncate">{value || placeholder}</span>
            </button>
            <Image
                src={icon}
                alt=""
                className={`pointer-events-none absolute top-1/2 right-[13px] -translate-y-1/2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
            {open && (
                <ul
                    ref={listRef}
                    id={listId}
                    role="listbox"
                    tabIndex={-1}
                    className="absolute top-full right-0 left-0 z-30 mt-1 max-h-60 scroll-my-4 overflow-auto rounded-lg border border-border-default bg-white py-1 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]"
                >
                    {options.map((option, index) => (
                        <li
                            key={option}
                            id={`${listId}-${index}`}
                            role="option"
                            aria-selected={option === value}
                            // mousedown keeps focus on the button, so the list stays open until the click.
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => pick(option)}
                            onMouseEnter={() => setActive(index)}
                            className={`cursor-pointer px-[13px] py-2 text-sm leading-5 ${
                                option === value ? "font-medium text-action" : "text-ink"
                            } ${index === active ? "bg-surface-brand-subtle" : ""}`}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Figma 1380:3248: country code in a cell (at least 38 wide) with a hairline
// divider, then the number 12 to its right. The code is a picker: a native
// select laid invisibly over the cell, so the cell shows only the code while
// the open list names each country. `codes` is [{ country, code }].
export function ApplyPhoneInput({ id, invalid, describedBy, countryCode, codes, onCountryCodeChange, ...props }) {
    return (
        <div
            className={`${boxClass} ${borderClass(invalid)} ${fillClass(props.value)} flex items-center gap-3 overflow-hidden pr-[13px] pl-[5px] focus-within:border-action`}
        >
            <span className="relative flex h-full min-w-[38px] shrink-0 items-center justify-center gap-0.5 border-r border-border-default pr-0.5 text-muted-ink">
                {countryCode}
                <Image src={chevronLight} alt="" width={16} height={16} />
                <select
                    suppressHydrationWarning
                    aria-label="Country code"
                    value={countryCode}
                    onChange={(event) => onCountryCodeChange(event.target.value)}
                    className="absolute inset-0 cursor-pointer appearance-none opacity-0"
                >
                    {codes.map(({ country, code }) => (
                        <option key={code} value={code}>
                            {country} ({code})
                        </option>
                    ))}
                </select>
            </span>
            <input
                suppressHydrationWarning
                id={id}
                type="tel"
                inputMode="numeric"
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-disabled"
                {...props}
            />
        </div>
    );
}
