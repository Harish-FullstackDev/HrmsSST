"use client";

import { useEffect, useState } from "react";

import HrSidebar from "./HrSidebar";
import HrTopBar from "./HrTopBar";

// Shared frame of the HR pages: the sidebar (closed by default, Figma
// 1898:5288; open, Figma 1905:1303), the top bar, then the page. It lives in
// the /hr layout, so the sidebar stays open or closed across HR pages.
// A page's side panel (anything marked data-hr-side-panel, fixed to the right
// edge) gets room on desktop: the whole frame, top bar included, narrows by
// its 424px width while it's open.
// `user` is the signed-in HR user: { name, role }.
export default function HrShell({ user, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!sidebarOpen) return;
        const onKeyDown = (event) => {
            // Escape closes the overlay sidebar; beside the page it stays.
            if (event.key === "Escape" && !window.matchMedia("(min-width: 64rem)").matches) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [sidebarOpen]);

    return (
        <div
            data-sidebar={sidebarOpen ? "open" : "closed"}
            className="group/hr flex min-h-dvh w-full flex-1 bg-white font-switzer text-ink transition-[padding] duration-300 ease-out motion-reduce:transition-none lg:has-[[data-hr-side-panel]]:pr-[424px]"
        >
            <HrSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col">
                <HrTopBar user={user} sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} />
                <main className="flex w-full flex-1 flex-col">{children}</main>
            </div>
        </div>
    );
}
