import { Suspense } from "react";

import JobOpenings from "@/components/HrJobOpenings/JobOpenings";
import { listJobsForHr } from "@/lib/applications/queries";
import JobOpeningsLoading from "./loading";

export const metadata = {
    title: "Job Openings · HRMS Portal",
};

async function JobOpeningsData() {
    const jobs = await listJobsForHr();
    return <JobOpenings jobs={jobs} />;
}

// The list reads the HR user's session, so it renders per request.
export default function Page() {
    return (
        <Suspense fallback={<JobOpeningsLoading />}>
            <JobOpeningsData />
        </Suspense>
    );
}
