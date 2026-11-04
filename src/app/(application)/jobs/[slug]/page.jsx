import { cache } from "react";
import Link from "next/link";

import JobDetailBody from "@/components/Jobs/JobDetailBody";
import JobDetailHero from "@/components/Jobs/JobDetailHero";
import JobsShell from "@/components/Jobs/JobsShell";
import { getJobBySlug, getOtherJobs } from "@/lib/jobs";

// Shared by the metadata and the page, so the job is fetched once.
const getJob = cache(getJobBySlug);

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const job = await getJob(slug);
    return { title: `${job ? job.title : "Job Not Found"} · HRMS Portal` };
}

// Figma 1619:11778: the job banner and body. A closed or unknown job gets a
// short notice instead.
export default async function Page({ params }) {
    const { slug } = await params;
    const job = await getJob(slug);
    const otherJobs = job ? await getOtherJobs(job.slug) : [];

    return (
        <JobsShell>
            {job ? (
                <>
                    <JobDetailHero job={job} />
                    <JobDetailBody job={job} otherJobs={otherJobs} />
                </>
            ) : (
                <section className="flex w-full flex-col items-center gap-4 px-4 py-16 text-center sm:px-16">
                    <h1 className="text-2xl leading-[1.2] font-medium text-ink">Job Not Found</h1>
                    <p className="max-w-[480px] text-base leading-[1.5] text-ink-secondary">
                        This position may have been filled or is no longer accepting applications.
                    </p>
                    <Link
                        href="/jobs"
                        className="mt-2 inline-flex h-12 items-center rounded-lg bg-action px-7 text-base leading-[1.5] text-white capitalize transition-colors hover:bg-[#005192]"
                    >
                        See Open Roles
                    </Link>
                </section>
            )}
        </JobsShell>
    );
}
