import Link from "next/link";

// Temporary landing after login until the dashboard is designed.
export default function DashboardPlaceholder() {
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 p-8 font-sans">
            <h1 className="text-3xl font-semibold text-zinc-900">HRMS Portal</h1>
            <p className="text-zinc-600">Next.js + Tailwind CSS + Supabase</p>
            {/* Temporary shortcut until the dashboard is designed. */}
            <Link href="/jobs" className="text-action underline hover:no-underline">
                Search jobs
            </Link>
        </main>
    );
}
