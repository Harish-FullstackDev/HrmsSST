"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import filterIcon from "@/assets/HrJobOpenings/icons/filter-16.svg";
import sortLinesIcon from "@/assets/HrJobOpenings/icons/sort-lines-16.svg";
import calendarIcon from "@/assets/HrCommon/icons/calendar-16.svg";
import chevronSmallIcon from "@/assets/HrCommon/icons/chevron-down-8.svg";
import chevronIcon from "@/assets/HrCommon/icons/chevron-down-16.svg";
import sortIcon from "@/assets/HrCommon/icons/sort-16.svg";
import HrMenu from "@/components/HrCommon/HrMenu";
import HrPagination from "@/components/HrCommon/HrPagination";

// Pieces shared by the HR list pages (applicants, Figma 2060:2170; job
// openings): the search field and period menu above the card, the grey filter
// buttons in its title row, and the white table's cell styles.

export const ALL = "all";

export const hrHeadCell = "h-[52px] px-[18px] text-left text-sm leading-[1.4] font-normal text-[#555555]";
export const hrCell = "px-[18px] text-xs leading-[1.4] text-[#16161a]";
export const hrRowLine = "border-b border-neutral-100 last:border-b-0";

// Figma "Job Opening": 32-tall grey toolbar buttons (Filter, Sort).
const toolbarButton =
    "flex h-8 items-center rounded bg-neutral-200 px-3.5 text-sm leading-[1.4] whitespace-nowrap text-ink transition-colors hover:bg-[#d9dde3]";

const filterButton =
    "flex h-[35px] items-center rounded bg-neutral-200 px-5 text-sm leading-[1.4] whitespace-nowrap text-ink transition-colors hover:bg-[#d9dde3]";

// Date ranges and periods are worked out when one is picked, never while
// rendering, so a page renders the same on the server and in the browser.
const isoDaysAgo = (days) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
const quarterOf = (date) => Math.floor(date.getUTCMonth() / 3);
const isoMonthStart = (year, month) => new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);

export const ANY_DATE = { label: "Any date", since: null };
const DATE_RANGES = [
    { label: "Any date", days: null },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
];

// Each period covers [from, until) as ISO dates; "All Time" has neither.
export const ALL_TIME = { label: "All Time" };
const PERIODS = [
    { label: "All Time", range: () => ALL_TIME },
    {
        label: "This Quarter",
        range: () => {
            const now = new Date();
            const q = quarterOf(now);
            const year = now.getUTCFullYear();
            return { label: `This Quarter (Q${q + 1})`, from: isoMonthStart(year, q * 3), until: isoMonthStart(year, q * 3 + 3) };
        },
    },
    {
        label: "Last Quarter",
        range: () => {
            const now = new Date();
            const q = quarterOf(now) - 1;
            const year = now.getUTCFullYear();
            return {
                label: `Last Quarter (Q${((q + 4) % 4) + 1})`,
                from: isoMonthStart(year, q * 3),
                until: isoMonthStart(year, q * 3 + 3),
            };
        },
    },
    {
        label: "This Year",
        range: () => {
            const year = new Date().getUTCFullYear();
            return { label: `This Year (${year})`, from: isoMonthStart(year, 0), until: isoMonthStart(year + 1, 0) };
        },
    },
];

// True when an ISO date falls inside the picked date range and period.
export const withinDates = (isoDate, dateRange, period) =>
    (!dateRange.since || isoDate >= dateRange.since) && (!period.from || (isoDate >= period.from && isoDate < period.until));

// The top bar's search text (?q=), lower-cased and trimmed; "" when empty.
export function useTopSearch() {
    return (useSearchParams().get("q") ?? "").trim().toLowerCase();
}

// A filter in HrFilterPanel with a long option list (Role): type to narrow
// the list, then pick with a click or the arrow keys and Enter. The first
// option ("All roles") clears it. Shows the chosen option's label when not
// typing; leaving the field without picking keeps the old choice.
function FilterCombobox({ id, label, options, value, onChange }) {
    const [query, setQuery] = useState(null); // null while not typing
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const inputId = `filter-${id}`;
    const listId = `${inputId}-list`;

    const selected = options.find((option) => option.value === value) ?? options[0];
    const search = (query ?? "").trim().toLowerCase();
    const shown = search ? options.filter((option) => option.label.toLowerCase().includes(search)) : options;
    const activeIndex = Math.min(active, Math.max(0, shown.length - 1));

    useEffect(() => {
        if (open) document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex, listId]);

    const close = () => {
        setOpen(false);
        setQuery(null);
    };
    const choose = (option) => {
        onChange(option.value);
        close();
    };

    const onKeyDown = (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) {
                setOpen(true);
                setActive(Math.max(0, shown.indexOf(selected)));
                return;
            }
            const step = event.key === "ArrowDown" ? 1 : -1;
            setActive((activeIndex + step + shown.length) % Math.max(1, shown.length));
        } else if (event.key === "Enter" && open) {
            event.preventDefault();
            if (shown[activeIndex]) choose(shown[activeIndex]);
        } else if (event.key === "Escape" && open) {
            event.preventDefault();
            close();
        }
    };

    return (
        <div className="relative flex flex-col gap-1.5 text-xs leading-[1.4] text-ink-secondary">
            <label htmlFor={inputId}>{label}</label>
            <input
                id={inputId}
                type="text"
                role="combobox"
                autoComplete="off"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={open && shown.length > 0 ? `${listId}-${activeIndex}` : undefined}
                placeholder={`Search ${label.toLowerCase()}…`}
                value={query ?? (selected === options[0] ? "" : selected.label)}
                onFocus={() => setOpen(true)}
                onClick={() => setOpen(true)}
                onBlur={close}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                    setOpen(true);
                }}
                onKeyDown={onKeyDown}
                className="h-9 rounded-lg border border-border-default bg-[#f8f9fa] px-3 text-sm text-ink outline-none placeholder:text-ink-secondary focus:border-action"
            />
            {open && (
                <ul
                    id={listId}
                    role="listbox"
                    aria-label={label}
                    className="absolute top-full right-0 left-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border-default bg-white py-1 shadow-[0_1px_5.3px_rgba(0,0,0,0.25)]"
                >
                    {shown.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-muted-ink">No matching {label.toLowerCase()}s</li>
                    ) : (
                        shown.map((option, index) => (
                            <li
                                key={option.value}
                                id={`${listId}-${index}`}
                                role="option"
                                aria-selected={option.value === value}
                                // mousedown, not click: picking must happen
                                // before the input's blur closes the list.
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    choose(option);
                                }}
                                onMouseEnter={() => setActive(index)}
                                className={`cursor-pointer truncate px-3 py-2 text-sm ${
                                    index === activeIndex ? "bg-surface-brand-subtle text-action" : "text-ink"
                                } ${option.value === value ? "font-medium" : ""}`}
                            >
                                {option.label}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}

// Figma "Job Opening": a grey "Filter" button opening a panel of the list's
// filters (native selects, so the panel needs no nested menus). `filters`
// are { id, label, options: [{ value, label }], value, onChange, searchable? };
// a searchable one (a long list, like Role) is a type-to-search field
// instead. The button shows how many are set. The panel closes on Escape or
// a click outside.
export function HrFilterPanel({ filters, onClear }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const active = filters.filter((filter) => filter.value !== filter.options[0].value).length;

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
        // A searchable filter's open list takes Escape first (it calls
        // preventDefault), then the panel.
        const onKeyDown = (event) => event.key === "Escape" && !event.defaultPrevented && setOpen(false);
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className={`${toolbarButton} gap-2.5`}
            >
                <Image src={filterIcon} alt="" width={16} height={16} />
                Filter
                {active > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-action text-xs text-white">{active}</span>
                )}
            </button>
            {open && (
                <div className="absolute top-full right-0 z-40 mt-1 flex w-64 flex-col gap-4 rounded-lg bg-white p-4 shadow-[0_1px_5.3px_rgba(0,0,0,0.25)]">
                    {filters.map((filter) =>
                        filter.searchable ? (
                            <FilterCombobox key={filter.id} {...filter} />
                        ) : (
                        <label key={filter.id} className="flex flex-col gap-1.5 text-xs leading-[1.4] text-ink-secondary">
                            {filter.label}
                            <select
                                value={filter.value}
                                onChange={(event) => filter.onChange(event.target.value)}
                                className="h-9 rounded-lg border border-border-default bg-[#f8f9fa] px-3 text-sm text-ink outline-none focus:border-action"
                            >
                                {filter.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        ),
                    )}
                    <button
                        type="button"
                        disabled={active === 0}
                        onClick={onClear}
                        className="self-end text-sm text-action hover:underline disabled:text-ink-disabled disabled:no-underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
}

// The Figma "Job Opening" Sort button: a menu of `sorts` ({ key: { label,
// compare } }).
export function HrSortButton({ sorts, value, onChange }) {
    return (
        <HrMenu
            label={`Sort by: ${sorts[value].label}`}
            items={Object.entries(sorts).map(([key, option]) => ({
                label: option.label,
                selected: key === value,
                onSelect: () => onChange(key),
            }))}
            className={`${toolbarButton} gap-2.5`}
        >
            <Image src={sortLinesIcon} alt="" width={16} height={16} />
            Sort
        </HrMenu>
    );
}

// The date-range filter's choices for a select: value is the label.
export const DATE_RANGE_OPTIONS = [
    { value: "Any date", label: "Any date", days: null },
    { value: "Last 7 days", label: "Last 7 days", days: 7 },
    { value: "Last 30 days", label: "Last 30 days", days: 30 },
    { value: "Last 90 days", label: "Last 90 days", days: 90 },
];

// The range picked from DATE_RANGE_OPTIONS, worked out at the moment of
// picking (see isoDaysAgo).
export function dateRangeFor(label) {
    const option = DATE_RANGE_OPTIONS.find((item) => item.value === label) ?? DATE_RANGE_OPTIONS[0];
    return { label: option.label, since: option.days ? isoDaysAgo(option.days) : null };
}

export function HrSearchField({ label, value, onChange }) {
    return (
        <label className="w-full max-w-[435px]">
            <span className="sr-only">{label}</span>
            <input
                suppressHydrationWarning
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search Jobs, Candidate, roles, etc..."
                className="h-10 w-full rounded bg-surface-brand-subtle px-[18px] text-sm leading-[1.4] text-ink outline-none placeholder:text-ink focus:ring-2 focus:ring-action"
            />
        </label>
    );
}

export function HrPeriodMenu({ value, onChange }) {
    return (
        <HrMenu
            label={`Period: ${value.label}`}
            items={PERIODS.map((option) => ({
                label: option.label,
                selected: value.label.startsWith(option.label),
                onSelect: () => onChange(option.range()),
            }))}
            className="flex h-10 min-w-[142px] items-center justify-center gap-1.5 rounded bg-surface-tint px-2 text-sm leading-[1.4] whitespace-nowrap text-ink-body transition-colors hover:bg-[#e2eafc]"
        >
            <Image src={calendarIcon} alt="" width={16} height={16} />
            {value.label}
            <Image src={chevronSmallIcon} alt="" width={8} height={8} />
        </HrMenu>
    );
}

// `sorts` is { key: { label, compare } }.
export function HrSortMenu({ sorts, value, onChange }) {
    return (
        <HrMenu
            label={`Sort by: ${sorts[value].label}`}
            items={Object.entries(sorts).map(([key, option]) => ({
                label: option.label,
                selected: key === value,
                onSelect: () => onChange(key),
            }))}
            className={`${filterButton} gap-2.5`}
        >
            <Image src={sortIcon} alt="" width={16} height={16} />
            Sort By
        </HrMenu>
    );
}

// A filter whose button shows the picked option, or `placeholder` while it's
// on ALL. `options` are { value, label }; the first should be the ALL one.
export function HrFilterMenu({ label, placeholder, options, value, onChange, className = "" }) {
    const picked = options.find((option) => option.value === value);
    return (
        <HrMenu
            label={label}
            items={options.map((option) => ({
                label: option.label,
                selected: option.value === value,
                onSelect: () => onChange(option.value),
            }))}
            className={`${filterButton} justify-between gap-6 ${className}`}
        >
            {value === ALL || !picked ? placeholder : picked.label}
            <Image src={chevronIcon} alt="" width={16} height={16} />
        </HrMenu>
    );
}

export function HrDateMenu({ value, onChange }) {
    return (
        <HrMenu
            label={`Date: ${value.label}`}
            items={DATE_RANGES.map((option) => ({
                label: option.label,
                selected: option.label === value.label,
                onSelect: () => onChange({ label: option.label, since: option.days ? isoDaysAgo(option.days) : null }),
            }))}
            className={`${filterButton} justify-between gap-6`}
        >
            {value.since ? value.label : "Date"}
            <Image src={chevronIcon} alt="" width={16} height={16} />
        </HrMenu>
    );
}

// A table whose header row stays put while only the rows scroll under it.
// The header and the rows are two tables sharing one set of column widths
// (`widths`, Tailwind width classes); both reserve the same scrollbar gutter
// so their columns line up. Narrow screens scroll the two sideways together.
// `head` is the header row's <th> cells; `children` are the body rows.
export function HrScrollTable({ widths, minWidth, head, empty, children, className = "" }) {
    const cols = (
        <colgroup>
            {widths.map((width, index) => (
                <col key={index} className={width} />
            ))}
        </colgroup>
    );
    return (
        <div className={`flex flex-col overflow-x-auto overflow-y-hidden lg:min-h-0 lg:flex-1 ${className}`}>
            <div style={{ minWidth }} className="flex flex-col lg:min-h-0 lg:flex-1">
                <div className="shrink-0 overflow-y-hidden rounded-t-lg bg-neutral-200 [scrollbar-gutter:stable]">
                    <table className="w-full table-fixed border-collapse">
                        {cols}
                        <thead>
                            <tr>{head}</tr>
                        </thead>
                    </table>
                </div>
                <div className="overflow-y-auto [scrollbar-gutter:stable] lg:min-h-0 lg:flex-1">
                    <table className="w-full table-fixed border-collapse">
                        {cols}
                        <tbody>{children}</tbody>
                    </table>
                    {empty}
                </div>
            </div>
        </div>
    );
}

// One page of `rows`, with the page clamped to the ones that exist (filters
// can shrink the list under the current page).
export function paginate(rows, page, pageSize) {
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const current = Math.min(page, pageCount);
    const start = (current - 1) * pageSize;
    return { page: current, pageCount, start, pageRows: rows.slice(start, start + pageSize) };
}

// "Showing 1–5 of 12" and the page buttons, under a list with more than one page.
export function HrListFooter({ paged, total, onPageChange, className = "" }) {
    if (paged.pageCount <= 1) return null;
    return (
        <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
            <p className="text-sm leading-[1.4] text-muted-ink">
                Showing {paged.start + 1}–{paged.start + paged.pageRows.length} of {total}
            </p>
            <HrPagination page={paged.page} pageCount={paged.pageCount} onChange={onPageChange} />
        </div>
    );
}

// A 12px rounded colour square and the status name. `swatch` is a bg class.
export function HrStatus({ swatch, children }) {
    return (
        <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-3 shrink-0 rounded-[3.5px] ${swatch}`} />
            {children}
        </span>
    );
}
