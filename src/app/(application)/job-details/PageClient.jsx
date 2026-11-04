"use client";

import PortalHeader from "@/components/CommonComponents/PortalHeader";
import BenefitsSection from "@/components/JobDetails/BenefitsSection";
import JobHero from "@/components/JobDetails/JobHero";
import JobOverview from "@/components/JobDetails/JobOverview";
import RoleSummaryCard from "@/components/JobDetails/RoleSummaryCard";
import { jobDetails } from "@/components/JobDetails/jobDetailsData";

// Figma frame 1380:2917 (1440 wide): job details, the first signed-in page.
// Everything sits 64 from the screen edges. On desktop the overview (max 738)
// and the 421-wide role card share a row 32 under the banner; 64 separates
// them from the benefits band. Below lg the card follows the overview.
const page = () => {
    const { title, reference, status, tags, summary, roleSummary, sections } = jobDetails;

    return (
        <div className="flex min-h-dvh w-full flex-1 flex-col bg-white font-switzer text-ink">
            <PortalHeader showProfileLink />
            <JobHero title={title} reference={reference} status={status} tags={tags} />

            <main className="flex w-full flex-1 flex-col gap-10 px-4 pt-8 pb-16 sm:px-16 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                <div className="w-full lg:max-w-[738px]">
                    <JobOverview summary={summary} sections={sections} />
                </div>
                <div className="w-full lg:w-[421px] lg:shrink-0">
                    <RoleSummaryCard rows={roleSummary} />
                </div>
            </main>

            <BenefitsSection />
        </div>
    );
};

export default page;
