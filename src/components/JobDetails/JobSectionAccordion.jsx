"use client";

import { useId, useState } from "react";

// Figma 1380:3005: 56-tall brand-subtle bar with an 18px title and a 26px
// "+" tile. The design only shows the closed state; the body opens below the
// title inside the same tile. The icon follows the shared toggle pattern: a
// fixed horizontal bar plus a vertical one that turns flat on open (+ to −).
export default function JobSectionAccordion({ title, items }) {
    const [open, setOpen] = useState(false);
    const panelId = useId();

    return (
        <div className="w-full overflow-hidden rounded-lg bg-surface-brand-subtle">
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((value) => !value)}
                className="flex h-14 w-full cursor-pointer items-center justify-between gap-4 p-3 text-left"
            >
                <span className="text-lg leading-[1.2] font-medium text-ink">{title}</span>
                <span aria-hidden="true" className="relative size-[26px] shrink-0 rounded bg-primary-200">
                    <span className="absolute top-1/2 left-1/2 h-[1.625px] w-[13px] -translate-1/2 bg-action" />
                    <span
                        className={`absolute top-1/2 left-1/2 h-[1.625px] w-[13px] -translate-1/2 bg-action transition-transform duration-300 ${
                            open ? "rotate-0" : "rotate-90"
                        }`}
                    />
                </span>
            </button>
            <div
                id={panelId}
                className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
                <div className="overflow-hidden" inert={!open}>
                    <ul className="flex list-disc flex-col gap-2 pr-3 pb-4 pl-8 text-sm leading-5 text-ink-secondary">
                        {items.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
