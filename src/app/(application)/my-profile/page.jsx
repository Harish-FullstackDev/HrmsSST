import { Suspense } from "react";

import JobsShell from "@/components/Jobs/JobsShell";
import MyApplications from "@/components/Jobs/MyApplications";
import MyProfile from "@/components/Profile/MyProfile";
import { listMyApplications } from "@/lib/applications/queries";
import { getProfile } from "@/lib/auth/hr";

export const metadata = {
    title: "My Profile · HRMS Portal",
};

async function MyApplicationsData() {
    const applications = await listMyApplications();
    return <MyApplications applications={applications} embedded />;
}

async function ProfileData() {
    const profile = await getProfile();
    const account = {
        name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" "),
        email: profile?.email ?? "",
    };
    return (
        <MyProfile
            account={account}
            applications={
                <Suspense fallback={<div className="h-[175px] w-full animate-pulse rounded-xl bg-neutral-100" aria-busy="true" />}>
                    <MyApplicationsData />
                </Suspense>
            }
        />
    );
}

// The account and applications read the candidate's session, so they render
// per request.
export default function Page() {
    return (
        <JobsShell fit>
            <Suspense fallback={<div className="m-8 h-[600px] animate-pulse rounded-xl bg-neutral-100" aria-busy="true" />}>
                <ProfileData />
            </Suspense>
        </JobsShell>
    );
}
