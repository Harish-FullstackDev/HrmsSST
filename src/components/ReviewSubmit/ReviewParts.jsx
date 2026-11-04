import Image from "next/image";
import Link from "next/link";

import editIcon from "@/assets/Apply/icons/edit-10.svg";

// Read-only building blocks of the review stage (Figma 1878:21894).

// Figma 1878:21982: a white card (24 padding, 12 radius) with its 18px title
// and an "Edit" link with a pencil, 24 above the content. Edit goes back to
// that stage; the entries are kept, so the candidate can change one thing
// and come back.
export function ReviewCard({ title, editHref, children, className = "" }) {
    return (
        <section aria-label={title} className={`flex w-full flex-col gap-6 rounded-xl bg-white p-6 ${className}`}>
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-base leading-[1.2] font-medium text-ink">{title}</h2>
                {editHref && (
                    <Link
                        href={editHref}
                        className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm leading-[1.4] text-action transition-colors hover:bg-surface-brand-subtle"
                    >
                        Edit<span className="sr-only"> {title}</span>
                        <Image src={editIcon} alt="" width={10.5} height={10.5} />
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}

// Four columns (or `columns={5}`), 32 apart (two on tablets, one on phones).
export function ReviewGrid({ columns = 4, children }) {
    return (
        <dl className={`grid w-full gap-x-8 gap-y-6 md:grid-cols-2 ${columns === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
            {children}
        </dl>
    );
}

const isEmpty = (value) => value == null || value === "" || (Array.isArray(value) && value.length === 0);

// Figma 1878:21991: the term over the 14px answer, 2 apart. A list answer
// shows one per line, or with `tags` one grey tag per line, 6 apart (Figma
// 1947:14129); a missing one "Not provided".
export function ReviewField({ label, value, tags = false, className = "" }) {
    return (
        <div className={`flex min-w-0 flex-col ${tags ? "gap-1.5" : "gap-0.5"} ${className}`}>
            <dt className="text-sm leading-[1.4] text-ink-secondary">{label}</dt>
            <dd className={`text-sm leading-[1.4] break-words ${isEmpty(value) ? "text-hint" : "text-ink"}`}>
                {isEmpty(value)
                    ? "Not provided"
                    : tags && Array.isArray(value)
                      ? (
                            <ul className="flex flex-col items-start gap-1.5">
                                {value.map((item, index) => (
                                    <li key={index} className="max-w-full rounded bg-[#f8f9fa] px-3 py-1.5">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )
                      : Array.isArray(value)
                      ? value.map((item, index) => (
                            <span key={index} className="block">
                                {item}
                            </span>
                        ))
                      : value}
            </dd>
        </div>
    );
}

// Figma 1878:22121: answers as small grey tags (skills, certifications).
// `as="dl-item"` renders the label and tags as <dt> / <dd> for use inside a
// <dl>; `stacked` puts one tag per line.
export function ReviewTags({ label, items, as, stacked = false, className = "" }) {
    const inList = as === "dl-item";
    const Term = inList ? "dt" : "p";
    const Details = inList ? "dd" : "div";
    return (
        <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
            <Term className="text-sm leading-[1.4] text-ink-secondary">{label}</Term>
            {items.length === 0 ? (
                <Details className="text-sm leading-[1.4] text-hint">Not provided</Details>
            ) : (
                <Details>
                    <ul className={stacked ? "flex flex-col items-start gap-1.5" : "flex flex-wrap gap-1.5"}>
                        {items.map((item, index) => (
                            <li key={index} className="max-w-full rounded bg-[#f8f9fa] px-3 py-1.5 text-sm leading-[1.4] text-ink">
                                {item}
                            </li>
                        ))}
                    </ul>
                </Details>
            )}
        </div>
    );
}
