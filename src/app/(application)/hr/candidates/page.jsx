import { Suspense } from "react";

import Applicants from "@/components/HrApplicants/Applicants";
import { listApplicationsForHr } from "@/lib/applications/queries";
import CandidatesLoading from "./loading";

export const metadata = {
    title: "Applicants · HRMS Portal",
};

async function ApplicantsData() {
    const applicants = await listApplicationsForHr();
    return <Applicants initialApplicants={applicants} />;
}

// The list reads the HR user's session, so it renders per request.
export default function Page() {
    return (
        <Suspense fallback={<CandidatesLoading />}>
            <ApplicantsData />
        </Suspense>
    );
}
