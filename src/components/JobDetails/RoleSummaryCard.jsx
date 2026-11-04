"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import arrowForward from "@/assets/JobDetails/icons/arrow-forward-12.svg";
import bookmark from "@/assets/JobDetails/icons/bookmark-16.svg";
import bookmarkFilled from "@/assets/JobDetails/icons/bookmark-filled-16.svg";

// Figma 1380:2971: 421-wide sidebar card, 24 padding, 16 between blocks.
// Colors here are the raw hex values Figma uses (no tokens in the file).
export default function RoleSummaryCard({ rows }) {
    // No shortlist backend yet; the toggle is local to the page.
    const [saved, setSaved] = useState(false);

    return (
        <aside className="flex w-full flex-col gap-4 rounded-xl bg-white p-6 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
            <h2 className="text-lg leading-[1.2] font-medium text-[#000412]">Role Summary</h2>

            <dl className="flex flex-col gap-1 py-1 text-sm leading-5">
                {rows.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                        <dt className="text-[#44474d]">{label}</dt>
                        <dd className="text-right text-[#000412]">{value}</dd>
                    </div>
                ))}
            </dl>

            <Link
                href="/apply/upload-resume"
                className="flex h-11 w-full items-center justify-center gap-1 rounded-lg bg-[#000412] text-lg leading-[1.2] font-medium text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#000412]/90"
            >
                Apply for this Position
                <Image src={arrowForward} alt="" width={12} height={12} />
            </Link>

            <button
                type="button"
                aria-pressed={saved}
                onClick={() => setSaved((value) => !value)}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#eff4ff] text-lg leading-[1.2] font-medium text-[#0b1c30] hover:bg-[#e2ebff]"
            >
                <Image src={saved ? bookmarkFilled : bookmark} alt="" width={16} height={16} />
                {saved ? "Saved to Shortlist" : "Save to Shortlist"}
            </button>
        </aside>
    );
}
