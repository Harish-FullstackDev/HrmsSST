import Image from "next/image";
import Link from "next/link";

import iconArrow from "@/assets/Jobs/icons/arrow-right-21.svg";
import iconLocation from "@/assets/Jobs/icons/location-pin-17x21.svg";
import iconBriefcase from "@/assets/Jobs/icons/briefcase-meta-24.svg";
import iconClock from "@/assets/Jobs/icons/clock-meta-24.svg";

function Meta({ icon, children }) {
    return (
        <span className="flex items-center gap-[6px] whitespace-nowrap">
            {icon}
            {children}
        </span>
    );
}

// Figma 1524:415: title block over a 0.5px rule, a summary, then location /
// experience / work type. The subtitle shows the department, since the work
// type is already in the meta row. Used for similar jobs; the search has its
// own row card (JobListingCard). `className` boxes the card and
// `summaryLines` sets the summary clamp.
export default function JobCard({ job, className = "", summaryLines = "line-clamp-2" }) {
    const subtitle = job.categories[0] ?? job.typeOfWork;

    return (
        <Link href={`/jobs/${job.slug}`} className={`group flex flex-col gap-4 ${className}`}>
            <div className="flex items-start justify-between gap-4 border-b-[0.5px] border-border-strong pb-2">
                <div className="flex flex-col gap-[6px] capitalize text-ink">
                    <h3 className="text-lg leading-[1.2] font-medium">{job.title}</h3>
                    {subtitle && <p className="text-base leading-[1.5]">{subtitle}</p>}
                </div>

                {/* Figma turns the 21×16 arrow -47° to point up-right. */}
                <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-action transition-colors duration-300 group-hover:bg-[#005192]">
                    <Image
                        src={iconArrow}
                        alt=""
                        className="h-4 w-[21px] -rotate-[47deg] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                </span>
            </div>

            {job.aboutJob && (
                <p className={`${summaryLines} text-sm leading-[1.5] text-ink-secondary capitalize`}>{job.aboutJob}</p>
            )}

            <JobMeta job={job} textClass="text-sm" />
        </Link>
    );
}

// Location / experience / work type row, shared with JobListingCard and the
// saved jobs. `textClass` sets the type size.
export function JobMeta({ job, textClass = "text-base" }) {
    return (
        <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${textClass} leading-[1.5] text-ink capitalize`}>
            {job.location && (
                <Meta
                    icon={
                        <span className="flex size-6 items-center justify-center">
                            <Image src={iconLocation} alt="" width={17} height={21} />
                        </span>
                    }
                >
                    {job.location}
                </Meta>
            )}
            {job.experienceLevel && (
                <Meta icon={<Image src={iconBriefcase} alt="" width={24} height={24} />}>{job.experienceLevel}</Meta>
            )}
            {job.typeOfWork && (
                <Meta icon={<Image src={iconClock} alt="" width={24} height={24} />}>{job.typeOfWork}</Meta>
            )}
        </div>
    );
}
