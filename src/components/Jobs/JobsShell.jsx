import PortalHeader from "@/components/CommonComponents/PortalHeader";

// Shared frame of the job pages (Search Jobs, a job, Saved Jobs, My
// Application): the signed-in header, then the page. Ported from the
// website's CandidateShell; the header's links replace its candidate tabs.
// `fit`: on wide screens (lg) the frame is exactly the window's height, so a
// page can scroll its own parts instead of the whole window (My Profile).
export default function JobsShell({ fit = false, children }) {
    return (
        <div
            className={`flex min-h-dvh w-full flex-1 flex-col bg-white font-switzer text-ink ${fit ? "lg:h-dvh lg:overflow-hidden" : ""}`}
        >
            <PortalHeader showProfileLink />
            <main className={`flex w-full flex-1 flex-col ${fit ? "lg:min-h-0" : ""}`}>{children}</main>
        </div>
    );
}
