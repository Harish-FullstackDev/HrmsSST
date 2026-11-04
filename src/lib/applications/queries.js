// Reads for the hiring pages, with the visitor's session so RLS applies:
// candidates get their own rows, HR gets everything. Server code only; each
// call reads cookies, so callers render inside a Suspense boundary.

import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

const isoDay = (timestamp) => (timestamp ? timestamp.slice(0, 10) : null);

async function client() {
    // Supabase checks the token's expiry against Date.now(), which Next
    // refuses while prerendering; connection() defers this to the request.
    await connection();
    return createClient();
}

// Every application, newest first, for the HR applicants list.
export async function listApplicationsForHr() {
    const supabase = await client();
    const { data, error } = await supabase
        .from("applications")
        .select("id, reference, status, first_name, last_name, email, phone, resume_path, resume_name, submitted_at, jobs(title, type_of_work)")
        .order("submitted_at", { ascending: false });
    if (error) throw new Error(`Loading applications failed: ${error.message}`);

    return data.map((row) => ({
        id: row.id,
        reference: row.reference,
        name: `${row.first_name} ${row.last_name}`.trim(),
        email: row.email,
        phone: row.phone,
        role: row.jobs?.title ?? "",
        type: row.jobs?.type_of_work ?? "",
        appliedOn: isoDay(row.submitted_at),
        status: row.status,
        resume: row.resume_name,
        resumePath: row.resume_path,
    }));
}

// Every job with its number of applications, newest first, for the HR job
// openings list. Drafts have no posted date, so they sort by creation.
export async function listJobsForHr() {
    const supabase = await client();
    const { data, error } = await supabase
        .from("jobs")
        .select("id, job_code, slug, title, department, type_of_work, vacancies, status, posted_at, created_at, applications(count)")
        .order("created_at", { ascending: false });
    if (error) throw new Error(`Loading jobs failed: ${error.message}`);

    return data.map((row) => ({
        id: row.id,
        code: row.job_code,
        slug: row.slug,
        title: row.title,
        department: row.department,
        type: row.type_of_work,
        vacancies: row.vacancies,
        applications: row.applications?.[0]?.count ?? 0,
        status: row.status,
        postedOn: isoDay(row.posted_at ?? row.created_at),
    }));
}

// Every interview, soonest first, with its candidate and job, for the HR
// Interview Schedule.
export async function listInterviewsForHr() {
    const supabase = await client();
    const { data, error } = await supabase
        .from("interviews")
        .select(
            "id, title, interviewer, scheduled_at, mode, meeting_link, status, applications(first_name, last_name, email, jobs(title, type_of_work))",
        )
        .order("scheduled_at", { ascending: true });
    if (error) throw new Error(`Loading interviews failed: ${error.message}`);

    return data.map((row) => ({
        id: row.id,
        title: row.title,
        interviewer: row.interviewer,
        scheduledAt: row.scheduled_at,
        scheduledOn: isoDay(row.scheduled_at),
        mode: row.mode,
        meetingLink: row.meeting_link,
        status: row.status,
        name: `${row.applications?.first_name ?? ""} ${row.applications?.last_name ?? ""}`.trim(),
        email: row.applications?.email ?? "",
        role: row.applications?.jobs?.title ?? "",
        type: row.applications?.jobs?.type_of_work ?? "",
    }));
}

// Interview times shown to candidates, on India time like the HR side:
// "Tue, 4 Nov, 2:00 pm".
const slotFormat = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
});
const MODE_LABELS = { online: "Online", in_person: "In person", phone: "Phone" };

// The soonest scheduled interview that hasn't ended, in the shape
// MyApplications' interview panel takes, or null.
function nextInterview(interviews, now) {
    const upcoming = (interviews ?? [])
        .filter((item) => item.status === "scheduled")
        .map((item) => ({ ...item, end: new Date(item.scheduled_at).getTime() + item.duration_minutes * 60_000 }))
        .filter((item) => item.end > now)
        .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0];
    if (!upcoming) return null;

    const slot = slotFormat.format(new Date(upcoming.scheduled_at));
    return {
        title: upcoming.title,
        when: `${slot} · ${upcoming.duration_minutes} min · ${MODE_LABELS[upcoming.mode] ?? upcoming.mode}`,
        slot,
        provider: upcoming.meeting_link ? "Meeting" : null,
        link: upcoming.meeting_link || null,
        start: upcoming.scheduled_at,
        end: new Date(upcoming.end).toISOString(),
    };
}

// One job's row for the HR edit form, or null.
export async function getJobForHr(id) {
    const supabase = await client();
    const { data } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
    return data ?? null;
}

// The signed-in candidate's applications, newest first, with their jobs.
// (Filtered by candidate too: RLS alone would give an HR account everyone's.)
export async function listMyApplications() {
    const supabase = await client();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from("applications")
        .select(
            "id, reference, status, submitted_at, resume_name, jobs(slug, title, job_code, location, mode_of_work, department, categories), interviews(title, scheduled_at, duration_minutes, mode, meeting_link, status)",
        )
        .eq("candidate_id", user.id)
        .order("submitted_at", { ascending: false });
    if (error) throw new Error(`Loading your applications failed: ${error.message}`);

    const now = Date.now();
    return data.map((row) => ({
        interview: nextInterview(row.interviews, now),
        id: row.id,
        reference: row.reference,
        status: row.status,
        appliedAt: row.submitted_at,
        resumeName: row.resume_name,
        job: row.jobs
            ? {
                  slug: row.jobs.slug,
                  title: row.jobs.title,
                  jobCode: row.jobs.job_code,
                  location: row.jobs.location,
                  modeOfWork: row.jobs.mode_of_work,
                  department: row.jobs.department || row.jobs.categories?.[0] || "",
              }
            : null,
    }));
}

// The signed-in candidate's application for one job, if they have one (any
// status: a job takes one application per candidate, withdrawn ones too).
// { reference, appliedOn } or null. Read by the /apply layout.
export async function getMyApplicationForJob(jobId) {
    if (!jobId) return null;
    const supabase = await client();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
        .from("applications")
        .select("reference, submitted_at")
        .eq("job_id", jobId)
        .eq("candidate_id", user.id)
        .maybeSingle();
    if (!data) return null;
    return {
        reference: data.reference,
        appliedOn: new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        }).format(new Date(data.submitted_at)),
    };
}
