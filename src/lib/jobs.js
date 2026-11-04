// Published job postings for the careers pages, read from the portal's own
// Supabase project (HR manages them in /hr; see
// supabase/migrations/20261102000000_hiring.sql). Server code only.
//
// Published jobs are public (RLS lets anyone read them), so these reads use
// the publishable key without the visitor's session and can be cached across
// visitors. Plain fetch rather than supabase-js, whose client also opens a
// realtime socket that Node versions before 22 cannot create.

import { cacheLife, cacheTag } from "next/cache";

// Slug of the job being applied for, set by /jobs/<slug>/apply and read by
// the /apply layout.
export const APPLY_JOB_COOKIE = "hrms-apply-job";

// Cache tag on every published-jobs read. HR actions that change a job call
// updateTag(JOBS_TAG) so the careers pages show the change straight away.
export const JOBS_TAG = "jobs";

// The shape the careers components were written for (it matches the
// website's src/lib/jobs.js), plus the portal's own fields.
export function mapJob(row) {
    return {
        id: row.id,
        slug: row.slug,
        jobCode: row.job_code ?? null,
        title: row.title,
        department: row.department ?? "",
        location: row.location,
        modeOfWork: row.mode_of_work,
        typeOfWork: row.type_of_work,
        experienceLevel: row.experience_level,
        categories: row.categories || [],
        aboutJob: row.about_job,
        responsibilities: row.responsibilities || [],
        qualifications: row.qualifications || [],
        skills: row.skills || [],
        vacancies: row.vacancies ?? 1,
        postedAt: row.posted_at ?? null,
        closesOn: row.closes_on ?? null,
    };
}

// Published jobs matching the extra PostgREST `filters`, newest first. Cached
// for about a minute ("minutes" profile) and tagged JOBS_TAG.
async function fetchPublishedJobs(filters = {}) {
    "use cache";
    cacheLife("minutes");
    cacheTag(JOBS_TAG);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
        console.warn("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are not set; no jobs will load.");
        return [];
    }

    const query = new URLSearchParams({ select: "*", status: "eq.published", order: "posted_at.desc", ...filters });
    const response = await fetch(`${url}/rest/v1/jobs?${query}`, { headers: { apikey: key } });
    if (!response.ok) throw new Error(`Loading jobs failed: ${response.status} ${await response.text()}`);

    return (await response.json()).map(mapJob);
}

export function getAllJobs() {
    return fetchPublishedJobs();
}

export async function getJobBySlug(slug) {
    const [job] = await fetchPublishedJobs({ slug: `eq.${slug}`, limit: "1" });
    return job ?? null;
}

export function getOtherJobs(slug, limit = 3) {
    return fetchPublishedJobs({ slug: `neq.${slug}`, limit: String(limit) });
}
