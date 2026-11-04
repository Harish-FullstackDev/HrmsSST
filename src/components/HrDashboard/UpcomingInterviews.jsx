import Image from "next/image";
import Link from "next/link";

import arrowRightIcon from "@/assets/HrDashboard/icons/arrow-right-11.svg";
import { upcomingInterviews } from "./hrDashboardData";

// Figma 1898:5567: today's interviews, 12 apart, "View all" bottom right.
export default function UpcomingInterviews() {
    return (
        <section className="flex flex-col gap-3 rounded-xl border border-card-border bg-white px-[25px] pt-3.5 pb-3">
            <h2 className="text-lg leading-[1.2] font-medium text-ink-heading">Upcoming Interviews</h2>
            <ul className="flex flex-col gap-3">
                {upcomingInterviews.map(({ id, name, topic, time, meta, avatar }) => (
                    <li key={id} className="flex flex-col rounded-xl bg-surface-tint p-3.5">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <Image src={avatar} alt="" className="size-8 shrink-0 rounded-full object-cover" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm leading-[1.4] text-ink-heading">{name}</p>
                                    <p className="truncate text-xs leading-[1.4] text-ink-body">{topic}</p>
                                </div>
                            </div>
                            <span className="shrink-0 rounded bg-rail px-2 py-0.5 font-sans text-[11px] leading-[14px] font-semibold tracking-[0.33px] text-ink-body">
                                {time}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-row-divider pt-[5px]">
                            <p className="font-sans text-[10px] leading-[14px] tracking-[0.33px] text-ink-caption">{meta}</p>
                            <button
                                type="button"
                                className="rounded bg-primary px-2.5 py-1 font-sans text-[11px] leading-[14px] font-semibold tracking-[0.33px] text-white transition-colors hover:bg-action"
                            >
                                Join Call
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <Link href="#" className="flex items-center gap-1 self-end text-xs leading-[1.4] text-action hover:underline">
                View all
                <Image src={arrowRightIcon} alt="" className="size-[10.667px]" />
            </Link>
        </section>
    );
}
