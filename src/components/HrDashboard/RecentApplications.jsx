import Image from "next/image";
import Link from "next/link";

import arrowRightIcon from "@/assets/HrDashboard/icons/arrow-right-11.svg";
import chevronRightIcon from "@/assets/HrDashboard/icons/chevron-right-5x8.svg";
import { recentApplications } from "./hrDashboardData";

const STAGE_STYLES = {
    success: "bg-success-50 text-success-500",
    info: "bg-info-50 text-info-700",
    neutral: "bg-neutral-100 text-muted-ink",
    warning: "bg-warning-50 text-warning-600",
};

const headCell = "py-4 text-left text-sm leading-[1.4] font-normal whitespace-nowrap text-ink-heading";

// Figma 1898:5418: recent applications. Figma lays the heading row and the
// rows out separately, so its column titles drift off the columns; here they
// share one table. Below md the table scrolls sideways inside its card.
export default function RecentApplications() {
    const { total, rows } = recentApplications;

    return (
        <section
            aria-labelledby="recent-applications-title"
            className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-card-border bg-white"
        >
            {/* Paint containment keeps the 720 wide table from widening the page
                while the overlay sidebar animates on phones. */}
            <div className="overflow-x-auto [contain:paint]">
                <table className="w-full min-w-[720px] border-collapse">
                    <colgroup>
                        <col />
                        <col className="w-[22%]" />
                        <col className="w-[15%]" />
                        <col className="w-[20%]" />
                        <col className="w-[60px]" />
                    </colgroup>
                    <thead className="border-b border-row-divider">
                        <tr>
                            <th scope="col" className={`${headCell} pl-4`}>
                                <span className="flex items-center gap-2">
                                    <span id="recent-applications-title" className="text-lg leading-[1.2] font-medium">
                                        Recent Applications
                                    </span>
                                    <span className="rounded-full bg-surface-tint px-2 py-0.5 text-xs leading-[1.4] text-ink-body">
                                        {total} Total
                                    </span>
                                </span>
                            </th>
                            <th scope="col" className={headCell}>
                                Department &amp; Role
                            </th>
                            <th scope="col" className={`${headCell} px-3`}>
                                Score
                            </th>
                            <th scope="col" className={`${headCell} px-3`}>
                                Interview Stage
                            </th>
                            <th scope="col">
                                <span className="sr-only">Open</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.email} className="h-[85px] border-t border-row-divider first:border-t-0">
                                <td className="py-2 pr-4 pl-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Image
                                            src={row.avatar}
                                            alt=""
                                            className="size-9 shrink-0 rounded-full object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm leading-[1.4] text-ink">{row.name}</p>
                                            <p
                                                title={row.email}
                                                className="truncate font-sans text-[13px] leading-[18px] text-ink-body"
                                            >
                                                {row.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-2 pr-4">
                                    <p className="max-w-[120px] text-sm leading-[1.4] text-ink-heading">{row.role}</p>
                                    <p className="max-w-[120px] text-xs leading-[1.4] text-muted-ink">{row.department}</p>
                                </td>
                                <td className="px-3 py-2">
                                    <span className="flex h-[34px] w-[97px] items-center justify-center rounded-full bg-surface-brand-subtle text-xs leading-[1.4] text-ink-heading">
                                        {row.match}% Match
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <span
                                        className={`flex h-[34px] max-w-[134px] items-center justify-center rounded-full px-2.5 text-xs leading-[1.4] whitespace-nowrap ${STAGE_STYLES[row.stage]}`}
                                    >
                                        {row.stageLabel}
                                    </span>
                                </td>
                                <td className="py-2 pr-4 text-right">
                                    <Link
                                        href="#"
                                        aria-label={`Open ${row.name}'s application`}
                                        className="inline-flex rounded-lg px-1.5 pt-1.5 pb-2 hover:bg-surface-brand-subtle"
                                    >
                                        <Image src={chevronRightIcon} alt="" className="h-2 w-[4.933px]" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-auto flex items-center justify-between gap-4 border-t border-row-divider pt-[15px] pr-3.5 pb-3.5 pl-4">
                <p className="font-sans text-[13px] leading-[18px] text-ink-body">
                    Showing {rows.length} of {total} candidates
                </p>
                <Link href="/hr/candidates" className="flex items-center gap-1 text-xs leading-[1.4] whitespace-nowrap text-action hover:underline">
                    View all candidates
                    <Image src={arrowRightIcon} alt="" className="size-[10.667px]" />
                </Link>
            </div>
        </section>
    );
}
