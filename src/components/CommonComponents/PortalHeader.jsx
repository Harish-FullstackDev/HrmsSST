"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import ascendusLogo from "@/assets/CommonComponents/ascendus-logo-primary.svg";

// Candidate pages. A job page (/jobs/<slug>) sits under Search Jobs, so that
// link stays underlined there. The sign-in screens' header (Figma 1306:2571)
// has no Saved Jobs.
const LINKS = [
    { label: "Search Jobs", href: "/jobs" },
    { label: "Saved Jobs", href: "/saved-jobs", signedInOnly: true },
    { label: "My Profile", href: "/my-profile" },
];

// Figma 1306:2571: top bar of the careers-portal screens. Links and logo sit
// 64 in from the screen edges at every desktop width; the border runs edge
// to edge. Signed-in pages (`showProfileLink`) also show Saved Jobs.
export default function PortalHeader({ showProfileLink = false }) {
    const pathname = usePathname() ?? "";
    const current = LINKS.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`))?.href;

    return (
        <header className="relative w-full border-b border-primary-200">
            <div className="flex w-full items-center justify-between gap-4 px-4 pt-6 pb-4 sm:px-16 lg:pt-8 lg:pb-6">
                <nav className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm whitespace-nowrap leading-[1.5] capitalize sm:gap-x-8 sm:text-base">
                    {LINKS.filter((link) => showProfileLink || !link.signedInOnly).map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            aria-current={href === current ? "page" : undefined}
                            className={`underline-offset-4 hover:text-action ${href === current ? "underline" : ""}`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <Link href="/" className="shrink-0">
                    <Image
                        src={ascendusLogo}
                        alt="Ascendus Company"
                        priority
                        className="h-6 w-auto sm:h-8"
                    />
                </Link>
            </div>
        </header>
    );
}
