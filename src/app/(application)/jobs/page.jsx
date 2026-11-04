import JobSearch from "@/components/Jobs/JobSearch";
import JobsShell from "@/components/Jobs/JobsShell";
import { getAllJobs } from "@/lib/jobs";

export const metadata = {
    title: "Search Jobs · HRMS Portal",
};

// Figma 1619:11248: job search.
export default async function Page() {
    const jobs = await getAllJobs();

    return (
        <JobsShell>
            <JobSearch jobs={jobs} />
        </JobsShell>
    );
}
