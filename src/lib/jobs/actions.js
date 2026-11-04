"use server";

// HR Server Actions for job postings. Public endpoints like every Server
// Action: each checks the caller is HR and validates the input, and RLS
// checks the role again in the database.

import { updateTag } from "next/cache";
import { after } from "next/server";

import { hrSession } from "@/lib/auth/hr";
import { requestOrigin, sendJobPublishedEmail, sendQuietly } from "@/lib/email/hiringEmails";
import { JOBS_TAG } from "@/lib/jobs";
import { emptyJob, jobRow, jobValues, todayIso, validateJob } from "@/lib/jobs/jobForm";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Emails every HR account that job `jobId` just went live. Only called when
// a job moves into "published" (not when a live job is edited). The send runs
// after the response; a failure is logged, never returned.
async function notifyJobPublished(session, jobId) {
    const origin = await requestOrigin();
    after(() =>
        sendQuietly("Job published", async () => {
            const [{ data: job }, { data: hr }] = await Promise.all([
                session.supabase.from("jobs").select("*").eq("id", jobId).maybeSingle(),
                session.supabase.from("profiles").select("email").eq("role", "hr"),
            ]);
            if (!job || job.status !== "published") return;
            const recipients = [...new Set((hr ?? []).map((row) => row.email).filter(Boolean))];
            await sendJobPublishedEmail({ recipients, job, publishedBy: session.profile, origin });
        }),
    );
}

// The job ID a new job will get when saved, for the Create Job form:
// { ok: true, code } or { ok: false }. A preview only; the database assigns
// the real ID on insert.
export async function previewNextJobCode() {
    const session = await hrSession();
    if (!session) return { ok: false };
    const { data, error } = await session.supabase.rpc("peek_next_job_code");
    if (error || typeof data !== "string") return { ok: false };
    return { ok: true, code: data };
}

// One job, as the edit form takes it: { ok: true, job: { id, code, status,
// values } } or { ok: false, error }.
export async function getJobForEdit(id) {
    const session = await hrSession();
    if (!session) return { ok: false, error: "Only HR can edit jobs." };
    if (typeof id !== "string" || !UUID.test(id)) return { ok: false, error: "Job not found." };

    const { data, error } = await session.supabase.from("jobs").select("*").eq("id", id).maybeSingle();
    if (error || !data) return { ok: false, error: "This job couldn't be loaded. It may have been removed." };
    return { ok: true, job: { id: data.id, code: data.job_code, status: data.status, values: jobValues(data) } };
}

// The row menu on Job Openings: publish a draft or close a job. Publishing
// checks the whole job first, as the form's Publish does; a draft that isn't
// complete yet returns { ok: false, incomplete: true } so the page can open
// it in the form instead. Returns { ok: true } or { ok: false, error }.
export async function setJobStatus(id, status) {
    const session = await hrSession();
    if (!session) return { ok: false, error: "Only HR can change jobs." };
    if (typeof id !== "string" || !UUID.test(id) || !["published", "closed"].includes(status)) {
        return { ok: false, error: "That change isn't possible." };
    }

    const { data: job } = await session.supabase.from("jobs").select("*").eq("id", id).maybeSingle();
    if (!job) return { ok: false, error: "This job no longer exists." };
    if (job.status === status) return { ok: true };
    if (status === "published") {
        if (job.status !== "draft") return { ok: false, error: "Only a draft can be published from here." };
        const errors = validateJob(jobValues(job), { publish: true, today: todayIso() });
        if (Object.keys(errors).length > 0) {
            return { ok: false, incomplete: true, error: "Complete the job's details before publishing it." };
        }
    }

    const { error } = await session.supabase.from("jobs").update({ status }).eq("id", id);
    if (error) return { ok: false, error: "The job couldn't be updated. Please try again." };
    updateTag(JOBS_TAG);
    if (status === "published") await notifyJobPublished(session, id);
    return { ok: true };
}

// Deletes a job. A job that has applications can't be deleted (the database
// keeps them linked); it should be closed instead.
export async function deleteJob(id) {
    const session = await hrSession();
    if (!session) return { ok: false, error: "Only HR can delete jobs." };
    if (typeof id !== "string" || !UUID.test(id)) return { ok: false, error: "Job not found." };

    const { count } = await session.supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("job_id", id);
    if (count > 0) {
        return {
            ok: false,
            error: `This job has ${count} application${count === 1 ? "" : "s"}, so it can't be deleted. Close it instead.`,
        };
    }

    const { data, error } = await session.supabase.from("jobs").delete().eq("id", id).select("id");
    if (error) {
        // 23503: an application arrived since the count above.
        if (error.code === "23503") return { ok: false, error: "This job now has applications, so it can't be deleted. Close it instead." };
        return { ok: false, error: "The job couldn't be deleted. Please try again." };
    }
    if (!data?.length) return { ok: false, error: "This job no longer exists." };
    updateTag(JOBS_TAG);
    return { ok: true };
}

// Creates a job (no `id`) or updates one, as a draft or published.
// Returns { ok: true, id } or { ok: false, error?, errors? } where `errors`
// are per-field messages.
export async function saveJob({ id, values, publish }) {
    const session = await hrSession();
    if (!session) return { ok: false, error: "Only HR can post jobs." };
    if (id !== undefined && (typeof id !== "string" || !UUID.test(id))) return { ok: false, error: "Job not found." };
    if (values === null || typeof values !== "object" || Array.isArray(values)) return { ok: false, error: "Check the form." };

    // Only the form's own fields are read.
    const clean = Object.fromEntries(Object.keys(emptyJob).map((key) => [key, values[key] ?? emptyJob[key]]));
    const errors = validateJob(clean, { publish: Boolean(publish), today: todayIso() });
    if (Object.keys(errors).length > 0) return { ok: false, errors };

    // Whether this save takes the job live (a new job, or one that wasn't
    // published before), which emails HR.
    let goesLive = Boolean(publish);
    if (publish && id) {
        const { data: before } = await session.supabase.from("jobs").select("status").eq("id", id).maybeSingle();
        goesLive = before?.status !== "published";
    }

    const row = { ...jobRow(clean), status: publish ? "published" : "draft" };
    const query = id
        ? session.supabase.from("jobs").update(row).eq("id", id)
        : session.supabase.from("jobs").insert(row);
    const { data, error } = await query.select("id").maybeSingle();
    if (error || !data) {
        console.error("saveJob:", error?.code, error?.message ?? "no row returned");
        return { ok: false, error: "The job couldn't be saved. Please try again." };
    }

    // The careers pages cache published jobs; show the change straight away.
    updateTag(JOBS_TAG);
    if (goesLive) await notifyJobPublished(session, data.id);
    return { ok: true, id: data.id };
}
