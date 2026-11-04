import JobSectionAccordion from "@/components/JobDetails/JobSectionAccordion";
import JobCard from "./JobCard";

// Company-wide sections, the same on every posting (copy from
// jobDetailsData.js, still awaiting sign-off). Figma spells it "Acsendus".
const STATIC_SECTIONS = [
    {
        title: "About Ascendus",
        items: [
            "Ascendus delivers technology and digital transformation services for organisations across the region.",
        ],
    },
    {
        title: "Important Notice",
        items: ["Ascendus never asks candidates for payment at any stage of the hiring process."],
    },
];

// Figma 1619:11921: two columns, the 776 job column (56 inner gap to a 0.5px
// rule) and the 470 similar jobs column, 16 past the rule. Similar jobs are
// boxed cards 40 apart. Below lg they stack and the rule drops. The jobs
// table has no "Job Description" field, so the summary carries about_job.
export default function JobDetailBody({ job, otherJobs }) {
    const sections = [
        { title: "Roles and Responsibilities", items: job.responsibilities },
        { title: "Qualification", items: job.qualifications },
        ...STATIC_SECTIONS,
    ].filter((section) => section.items.length > 0);

    return (
        <section className="w-full px-4 pt-8 pb-16 sm:px-16">
            <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,776fr)_minmax(0,470fr)] lg:gap-4">
                <div className="flex flex-col gap-6 lg:border-r-[0.5px] lg:border-border-strong lg:pr-14">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg leading-[1.2] font-medium text-ink">Job Summary</h2>
                        <p className="text-sm leading-[1.4] text-ink-secondary">{job.aboutJob}</p>
                    </div>

                    {sections.map((section) => (
                        <JobSectionAccordion key={section.title} title={section.title} items={section.items} />
                    ))}
                </div>

                {otherJobs.length > 0 && (
                    <aside className="flex flex-col gap-6">
                        <h2 className="text-lg leading-[1.2] font-medium text-action">Similar jobs</h2>
                        <ul className="flex flex-col gap-10">
                            {otherJobs.map((other) => (
                                <li key={other.slug}>
                                    <JobCard job={other} summaryLines="line-clamp-3" className="rounded-xl bg-[#f7f7f7] p-6" />
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}
            </div>
        </section>
    );
}
