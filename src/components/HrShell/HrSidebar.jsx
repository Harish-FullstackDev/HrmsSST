"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import ascendusLogo from "@/assets/HrShell/ascendus-logo-full.svg";
import collapseIcon from "@/assets/HrShell/icons/collapse-24.svg";
import { HR_NAV_LINKS } from "./hrNavLinks";

// The nav SVGs come with fixed fills (blue, white on the active one), so they
// are drawn as masks in the link's text colour to follow the active state.
function NavIcon({ icon }) {
    return (
        <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
            <span
                className="bg-current"
                style={{
                    width: icon.width,
                    height: icon.height,
                    mask: `url(${icon.src}) center / contain no-repeat`,
                }}
            />
        </span>
    );
}

// Figma 1983:7446: the HR sidebar, 256 wide. Below lg it slides over the
// page; from lg it sits beside it and the page narrows when it opens.
export default function HrSidebar({ open, onClose }) {
    const pathname = usePathname() ?? "";

    return (
        <>
            <div
                aria-hidden="true"
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-ink/30 transition-opacity duration-300 lg:hidden ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />
            <aside
                id="hr-sidebar"
                aria-label="HR navigation"
                inert={!open}
                className={`fixed inset-y-0 left-0 z-50 h-dvh shrink-0 overflow-hidden bg-surface-brand-subtle shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-[translate,width] duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
                    open ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-0"
                }`}
            >
                <div className="flex h-full w-64 flex-col gap-3">
                    <div className="flex h-16 shrink-0 items-center justify-between bg-primary-100 pr-[22px] pl-[23px]">
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close menu"
                            aria-controls="hr-sidebar"
                            className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                        >
                            <Image src={collapseIcon} alt="" className="size-6" />
                        </button>
                        <Link href="/hr/dashboard" aria-label="Ascendus Company, dashboard">
                            <Image src={ascendusLogo} alt="" priority className="h-6 w-[123px]" />
                        </Link>
                    </div>

                    <nav className="flex flex-col gap-3 pt-2 pr-[22px] pl-3">
                        {HR_NAV_LINKS.map(({ label, href, icon }) => {
                            const active = pathname === href || pathname.startsWith(`${href}/`);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => {
                                        // The overlay sidebar closes once a page is picked.
                                        if (!window.matchMedia("(min-width: 64rem)").matches) onClose();
                                    }}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex h-9 items-center gap-2 rounded-lg px-4 text-sm leading-[1.4] whitespace-nowrap transition-colors ${
                                        active ? "bg-action text-white" : "text-ink hover:bg-primary-100"
                                    }`}
                                >
                                    <span className={active ? "text-white" : "text-action"}>
                                        <NavIcon icon={icon} />
                                    </span>
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
}
