"use client";

import Image from "next/image";
import Link from "next/link";

import ascendusMark from "@/assets/HrShell/ascendus-mark.svg";
import { usePathname, useSearchParams } from "next/navigation";

import bellIcon from "@/assets/HrShell/icons/bell-24.svg";
import helpIcon from "@/assets/HrShell/icons/help-circle-24.svg";
import menuIcon from "@/assets/HrShell/icons/menu-24.svg";

const ICON_BUTTONS = [
    { label: "Notifications", icon: bellIcon },
    { label: "Help", icon: helpIcon },
];

const initialsOf = (name) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

// The search in the bar filters the current list page: it keeps its text in
// the URL as ?q=, and the list pages read it with useTopSearch
// (HrListControls). history.replaceState updates the URL (and
// useSearchParams) without asking the server for the page again on every
// keystroke, and without adding each one to the Back history.
function TopSearch() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const onChange = (event) => {
        const params = new URLSearchParams(searchParams);
        if (event.target.value) params.set("q", event.target.value);
        else params.delete("q");
        const query = params.toString();
        window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    };

    return (
        <label className="hidden h-10 min-w-0 flex-1 items-center rounded bg-surface-brand-subtle px-4 md:flex md:max-w-[435px]">
            <span className="sr-only">Search</span>
            <input
                suppressHydrationWarning
                type="search"
                value={searchParams.get("q") ?? ""}
                onChange={onChange}
                placeholder="Search Jobs, Candidate, roles, etc..."
                className="w-full min-w-0 bg-transparent text-xs leading-[1.4] text-ink placeholder:text-ink focus:outline-none"
            />
        </label>
    );
}

// Figma 1898:5289: the HR top bar. 12 of space above a 71 tall bar. With the
// sidebar closed it starts with the Menu button and the Ascendus mark; with
// it open (Figma 1905:1304) the sidebar carries the logo, so from lg they hide.
// `user` is the signed-in HR user: { name, role }.
export default function HrTopBar({ user, sidebarOpen, onOpenSidebar }) {
    return (
        <header className="sticky top-0 z-30 bg-white pt-3 drop-shadow-[-2px_2px_1.3px_rgba(0,0,0,0.15)]">
            <div className="flex h-[71px] items-center gap-4 px-4 sm:gap-6 sm:px-8">
                <div className={`flex shrink-0 items-center gap-6 ${sidebarOpen ? "lg:hidden" : ""}`}>
                    <div className="flex h-14 items-center border-r-[0.5px] border-border-strong pr-4 sm:w-[82px] sm:pr-0">
                        <button
                            type="button"
                            onClick={onOpenSidebar}
                            aria-expanded={sidebarOpen}
                            aria-controls="hr-sidebar"
                            className="flex items-center gap-2 rounded text-xs leading-[1.4] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                        >
                            <Image src={menuIcon} alt="" className="size-6" />
                            Menu
                        </button>
                    </div>
                    <Link href="/hr/dashboard" aria-label="Ascendus Company, dashboard">
                        <Image src={ascendusMark} alt="" priority className="h-6 w-[30px]" />
                    </Link>
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-end gap-6 md:justify-between">
                    <TopSearch />

                    <div className="flex shrink-0 items-center gap-6">
                        {/* Figma 2060:2170: bell and help 8 apart, then the
                            user card (light blue, rounded 8, 6 padding) with
                            a 40 square initials tile, name and role. */}
                        <div className="flex items-center gap-2">
                            {ICON_BUTTONS.map(({ label, icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    aria-label={label}
                                    className="flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                                >
                                    <Image src={icon} alt="" width={24} height={24} />
                                </button>
                            ))}
                            <div className="flex h-[51px] items-center gap-2.5 rounded-lg bg-surface-brand-subtle p-1.5 sm:min-w-[182px] sm:pr-4">
                                <span
                                    aria-hidden="true"
                                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-200 text-sm leading-[1.4] text-[#16161a]"
                                >
                                    {initialsOf(user.name)}
                                </span>
                                <span className="sr-only sm:not-sr-only sm:flex sm:flex-col sm:gap-0.5">
                                    <span className="text-sm leading-[1.4] whitespace-nowrap text-[#16161a]">{user.name}</span>
                                    <span className="text-xs leading-[1.4] whitespace-nowrap text-[#8a8a93]">{user.role}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
