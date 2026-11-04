"use client";

import Image from "next/image";
import Link from "next/link";

import iconBookmark from "@/assets/Jobs/icons/bookmarks-24-dark.svg";
import iconBookmarkFilled from "@/assets/Jobs/icons/bookmarks-filled-24-dark.svg";

import { JobMeta } from "./JobCard";
import useSavedJob from "./useSavedJob";

// Figma 1566:1057: one full-width #f7f7f7 row per job. Title block and the
// View More / Save actions over a 0.5px rule, then the summary and the meta
// row. The subtitle shows the department, as JobCard does. Only the title and
// View More link to the job, since the card holds two controls.
export default function JobListingCard({ job }) {
    const [saved, toggleSaved] = useSavedJob(job.slug);
    const subtitle = job.categories[0] ?? job.typeOfWork;
    const href = `/jobs/${job.slug}`;

    return (
        <article className="flex flex-col gap-4 rounded-xl bg-[#f7f7f7] p-6">
            <div className="flex flex-col gap-4 border-b-[0.5px] border-border-strong pb-2 sm:min-h-[67px] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-[6px] capitalize text-ink">
                    <h2 className="text-2xl leading-[1.2] font-medium">
                        <Link href={href} className="transition-colors hover:text-action">
                            {job.title}
                        </Link>
                    </h2>
                    {subtitle && <p className="text-base leading-[1.5]">{subtitle}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-6">
                    <Link
                        href={href}
                        className="flex h-[33px] w-[126px] items-center justify-center rounded bg-action text-sm leading-[1.4] text-[#f8f8f8] transition-colors hover:bg-[#005192]"
                    >
                        View More
                    </Link>

                    <button
                        type="button"
                        aria-pressed={saved}
                        onClick={toggleSaved}
                        className="flex cursor-pointer items-center gap-1 text-sm leading-[1.4] text-ink transition-opacity hover:opacity-70"
                    >
                        <Image src={saved ? iconBookmarkFilled : iconBookmark} alt="" width={24} height={24} />
                        {saved ? "Saved" : "Save"}
                    </button>
                </div>
            </div>

            {job.aboutJob && (
                <p className="line-clamp-2 text-base leading-[1.5] text-ink-secondary capitalize lg:line-clamp-1">
                    {job.aboutJob}
                </p>
            )}

            <JobMeta job={job} />
        </article>
    );
}
