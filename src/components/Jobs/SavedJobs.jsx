"use client";

import Link from "next/link";

import { setJobSaved, useSavedJobSlugs } from "./candidateStorage";
import { JobMeta } from "./JobCard";

function BookmarkIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M6 3.75h12a.75.75 0 0 1 .75.75v16.2l-6.75-4.5-6.75 4.5V4.5A.75.75 0 0 1 6 3.75Z" />
        </svg>
    );
}

// Ref "saved.png": one full-width #f7f7f7 panel per job. Title and work type
// over a rule, View More and the bookmark on the right, then a one-line
// summary and the location / experience / work type row.
function SavedJobCard({ job, onUnsave }) {
    return (
        <article className="flex flex-col gap-4 rounded-xl bg-[#f7f7f7] px-6 py-7 transition-shadow duration-300 hover:shadow-[0px_8px_20px_-8px_rgba(0,48,86,0.25)]">
            <div className="flex flex-col gap-4 border-b border-border-default pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-[6px] text-ink capitalize">
                    <h2 className="text-2xl leading-[1.2] font-medium">
                        <Link href={`/jobs/${job.slug}`} className="transition-colors hover:text-action">
                            {job.title}
                        </Link>
                    </h2>
                    {job.typeOfWork && <p className="text-base leading-[1.5]">{job.typeOfWork}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-7">
                    <Link
                        href={`/jobs/${job.slug}`}
                        className="inline-flex h-8 items-center rounded-lg bg-action px-7 text-sm leading-[1.4] text-white transition-colors hover:bg-[#005192]"
                    >
                        View More
                    </Link>
                    {/* Every job here is saved, so the bookmark is filled and
                        pressing it removes the job from the list. */}
                    <button
                        type="button"
                        aria-pressed="true"
                        aria-label={`Remove ${job.title} from saved jobs`}
                        onClick={onUnsave}
                        className="flex cursor-pointer items-center gap-1 text-sm leading-[1.4] text-ink transition-colors hover:text-action"
                    >
                        <BookmarkIcon />
                        Saved
                    </button>
                </div>
            </div>

            {job.aboutJob && (
                <p className="line-clamp-1 text-base leading-[1.5] text-ink-secondary capitalize">{job.aboutJob}</p>
            )}

            <JobMeta job={job} />
        </article>
    );
}

// Single column of saved jobs. `jobs` is every open job, loaded on the
// server; the saved slugs live in this browser, so the list is picked here.
// Saved jobs that have since closed drop out, as `jobs` only has open roles.
export default function SavedJobs({ jobs }) {
    const saved = useSavedJobSlugs();
    const visible = saved ? jobs.filter((job) => saved.includes(job.slug)) : null;

    return (
        <section className="w-full px-4 py-10 sm:px-16 sm:pb-[88px]">
            <h1 className="sr-only">Saved Jobs</h1>

            {visible === null ? (
                <ul className="flex flex-col gap-8" aria-busy="true">
                    {Array.from({ length: 2 }, (_, index) => (
                        <li key={index} className="h-[188px] animate-pulse rounded-xl bg-[#f7f7f7]" />
                    ))}
                </ul>
            ) : visible.length === 0 ? (
                <div className="flex flex-col items-start gap-4 py-6">
                    <p className="text-base leading-[1.5] text-ink-secondary">
                        You haven&apos;t saved any jobs yet. Use Save Job on a role to keep it here.
                    </p>
                    <Link
                        href="/jobs"
                        className="inline-flex h-11 items-center rounded-lg bg-action px-6 text-base leading-[1.5] text-white transition-colors hover:bg-[#005192]"
                    >
                        Search Jobs
                    </Link>
                </div>
            ) : (
                <ul className="flex flex-col gap-8">
                    {visible.map((job) => (
                        <li key={job.slug}>
                            <SavedJobCard job={job} onUnsave={() => setJobSaved(job.slug, false)} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
