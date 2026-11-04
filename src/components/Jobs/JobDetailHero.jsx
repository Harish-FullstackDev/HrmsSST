"use client";

import Image from "next/image";

import heroBg from "@/assets/JobDetails/hero-bg.png";
import iconArrow from "@/assets/Jobs/icons/arrow-right-21-dark.svg";
import iconBookmark from "@/assets/Jobs/icons/bookmarks-24-light.svg";
import iconBookmarkFilled from "@/assets/Jobs/icons/bookmarks-filled-24-light.svg";

import useSavedJob from "./useSavedJob";

// Figma 1619:11895: full-bleed banner under the header with the title and
// Job ID, chips 16 below, then the action row 32 under the chips. Uses the
// portal's banner background (as JobHero does).
export default function JobDetailHero({ job }) {
    const [saved, toggleSaved] = useSavedJob(job.slug);
    const department = job.categories[0];
    // Admin data can repeat a value (location "Hybrid" with mode "Hybrid"), so
    // repeats collapse into one chip.
    const tags = [
        ...new Set([job.typeOfWork, job.modeOfWork, job.location, department && `Dept: ${department}`].filter(Boolean)),
    ];

    return (
        <section className="relative isolate w-full overflow-hidden bg-navy-900">
            <Image src={heroBg} alt="" fill priority sizes="100vw" className="-z-10 object-cover object-right" />
            <div className="flex w-full flex-col gap-8 px-4 py-8 sm:px-16">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[32px] leading-[1.2] font-medium text-white capitalize">{job.title}</h1>
                        {job.jobCode && <p className="text-sm leading-[1.4] text-primary-200">Job ID: {job.jobCode}</p>}
                    </div>
                    <ul className="flex flex-wrap items-center gap-3 text-sm leading-[1.4] text-white">
                        {tags.map((tag) => (
                            <li key={tag} className="rounded-md bg-[rgba(221,241,253,0.1)] p-[6px]">
                                {tag}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-wrap items-start gap-4">
                    {/* A plain link: /jobs/<slug>/apply is a route handler
                        (it picks the job, then redirects into the apply flow). */}
                    <a
                        href={`/jobs/${job.slug}/apply`}
                        className="group flex h-11 w-[264px] items-center justify-center gap-1 rounded-lg bg-[#f8f8f8] text-lg leading-[1.2] font-medium text-ink drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-white"
                    >
                        Apply for this Position
                        <Image
                            src={iconArrow}
                            alt=""
                            className="h-4 w-[21px] transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </a>

                    <button
                        type="button"
                        aria-pressed={saved}
                        onClick={toggleSaved}
                        className="flex h-11 cursor-pointer items-center gap-1 rounded-lg border border-border-strong p-[6px] text-lg leading-[1.2] font-medium text-white transition-colors hover:border-white"
                    >
                        <Image src={saved ? iconBookmarkFilled : iconBookmark} alt="" width={24} height={24} />
                        {saved ? "Saved" : "Save Job"}
                    </button>
                </div>
            </div>
        </section>
    );
}
