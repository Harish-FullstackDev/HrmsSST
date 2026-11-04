import JobsShell from "@/components/Jobs/JobsShell";
import SavedJobs from "@/components/Jobs/SavedJobs";
import { getAllJobs } from "@/lib/jobs";

export const metadata = {
    title: "Saved Jobs · HRMS Portal",
};

export default async function Page() {
    const jobs = await getAllJobs();

    return (
        <JobsShell>
            <SavedJobs jobs={jobs} />
        </JobsShell>
    );
}
