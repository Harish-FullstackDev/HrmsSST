import Image from "next/image";
import Link from "next/link";

import viewCandidateIcon from "@/assets/HrDashboard/icons/view-candidate-16.svg";
import viewCalendarIcon from "@/assets/HrDashboard/icons/view-calendar-16.svg";
import addTaskIcon from "@/assets/HrDashboard/icons/add-task-16.svg";
import generateReportIcon from "@/assets/HrDashboard/icons/generate-report-16.svg";

// Left column, then right column of each row.
const ACTIONS = [
    { label: "View Candidate", icon: viewCandidateIcon, href: "/hr/candidates" },
    { label: "View Calendar", icon: viewCalendarIcon },
    { label: "Add Task", icon: addTaskIcon },
    { label: "Generate Report", icon: generateReportIcon },
];

// Figma 1898:5533: quick actions, two per row. The right-hand links line up
// on their left edge and finish at the card's padding.
export default function QuickActions() {
    return (
        <section className="flex flex-col gap-6 rounded-xl border border-card-border bg-neutral-100 px-[25px] py-[17px]">
            <h2 className="text-lg leading-[1.2] font-medium text-ink-heading">Quick Actions</h2>
            <ul className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-[25px]">
                {ACTIONS.map(({ label, icon, href = "#" }) => (
                    <li key={label}>
                        <Link href={href} className="flex items-center gap-1 text-xs leading-[1.4] whitespace-nowrap text-action hover:underline">
                            <span className="flex size-4 shrink-0 items-center justify-center">
                                <Image src={icon} alt="" />
                            </span>
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
