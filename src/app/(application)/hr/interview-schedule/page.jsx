import { Suspense } from "react";

import InterviewSchedule from "@/components/HrInterviews/InterviewSchedule";
import { listInterviewsForHr } from "@/lib/applications/queries";
import InterviewScheduleLoading from "./loading";

export const metadata = {
    title: "Interview Schedule · HRMS Portal",
};

async function InterviewScheduleData() {
    const interviews = await listInterviewsForHr();
    return <InterviewSchedule interviews={interviews} />;
}

// The list reads the HR user's session, so it renders per request.
export default function Page() {
    return (
        <Suspense fallback={<InterviewScheduleLoading />}>
            <InterviewScheduleData />
        </Suspense>
    );
}
