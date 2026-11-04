import Image from "next/image";
import Link from "next/link";

import plusIcon from "@/assets/HrDashboard/icons/plus-9.svg";

const VIEWS = ["Recruitment", "Interview & Jobs", "Overview"];

const outlined = "flex h-10 items-center rounded border bg-white px-[15px] text-sm leading-[1.4] whitespace-nowrap text-ink-heading transition-colors hover:bg-surface-brand-subtle";

// Figma 1898:5321: dashboard views on the left, actions on the right.
export default function DashboardToolbar() {
    return (
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-[15px]">
                {VIEWS.map((view) => (
                    <button key={view} type="button" className={`${outlined} border-border-default`}>
                        {view}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={`${outlined} border-border-strong`}>
                    Modify your Dashboard
                </button>
                <Link
                    href="/hr/job-openings?new=1"
                    className="flex h-10 items-center gap-2 rounded bg-action px-4 text-sm leading-[1.4] whitespace-nowrap text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-primary"
                >
                    <Image src={plusIcon} alt="" className="size-[9.333px]" />
                    Create Job
                </Link>
            </div>
        </div>
    );
}
