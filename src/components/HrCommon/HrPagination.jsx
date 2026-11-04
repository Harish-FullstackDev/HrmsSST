import Image from "next/image";

import chevronLeftIcon from "@/assets/HrCommon/icons/chevron-left-16.svg";
import chevronRightIcon from "@/assets/HrCommon/icons/chevron-right-16-light.svg";

// Page numbers to show: the first three, an ellipsis, then the last, as in
// Figma (1 2 3 … 5); around the current page once it moves past them.
function pageItems(page, pageCount) {
    if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "…", pageCount];
    if (page >= pageCount - 2) return [1, "…", pageCount - 2, pageCount - 1, pageCount];
    return [1, "…", page, "…", pageCount];
}

const square = "flex size-8 items-center justify-center rounded-lg font-sans text-sm font-medium";

// Figma 1953:4253: Previous, page buttons 32 square and 6 apart, Next.
export default function HrPagination({ page, pageCount, onChange }) {
    return (
        <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1.5">
            <button
                type="button"
                onClick={() => onChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-border-default px-[13px] py-[7px] text-sm leading-[1.4] text-ink-secondary transition-opacity hover:bg-surface-brand-subtle disabled:opacity-50 disabled:hover:bg-transparent"
            >
                <Image src={chevronLeftIcon} alt="" className="size-4" />
                Previous
            </button>
            {pageItems(page, pageCount).map((item, index) =>
                item === "…" ? (
                    <span key={`gap-${index}`} className="flex h-8 w-6 items-center justify-center font-sans text-sm text-slate-muted">
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onChange(item)}
                        aria-current={item === page ? "page" : undefined}
                        aria-label={`Page ${item}`}
                        className={
                            item === page
                                ? `${square} bg-action text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]`
                                : `${square} border border-border-default text-ink hover:bg-surface-brand-subtle`
                        }
                    >
                        {item}
                    </button>
                ),
            )}
            <button
                type="button"
                onClick={() => onChange(page + 1)}
                disabled={page >= pageCount}
                className="flex items-center gap-1 rounded-lg bg-action px-3 py-1.5 text-sm leading-[1.4] text-white transition-opacity hover:bg-primary disabled:opacity-50 disabled:hover:bg-action"
            >
                Next
                <Image src={chevronRightIcon} alt="" className="size-4" />
            </button>
        </nav>
    );
}
