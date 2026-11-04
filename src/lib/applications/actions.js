"use server";

// Server Actions for applications. Like every Server Action these are public
// endpoints: each one checks who is calling and validates every input, and
// RLS (supabase/migrations/20261102000000_hiring.sql) checks again in the
// database.

import { after } from "next/server";

import { hrSession } from "@/lib/auth/hr";
import {
    STATUS_EMAIL_STATUSES,
    requestOrigin,
    sendApplicationReceivedEmail,
    sendQuietly,
    sendStatusChangeEmail,
} from "@/lib/email/hiringEmails";
import { verifyRecaptcha } from "@/lib/recaptcha/verifyRecaptcha";
import { createClient } from "@/lib/supabase/server";

// The stage 5 documents a candidate can attach (UploadDocumentsForm's
// DOCUMENTS_LIST, which is client code and can't be imported here).
const DOCUMENT_FIELDS = new Set(["photograph", "signature", "idProof", "tenthMarksheet", "twelfthMarksheet", "degreeCertificate"]);

// Statuses HR can set: not "applied" (where every application starts) or
// "withdrawn" (the candidate's own action). "hired" shows as Onboarding. A
// "use server" file may only export async functions, so this stays private.
const APPLICATION_STATUSES = [
    "screening",
    "shortlisted",
    "assessment",
    "interviewing",
    "offer",
    "hired",
    "rejected",
];

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// A Storage path the caller uploaded: inside their own folder, no "..".
const ownPath = (path, userId) =>
    typeof path === "string" && path.length <= 300 && path.startsWith(`${userId}/`) && !path.includes("..");

const FAILED = { ok: false, error: "Your application couldn't be submitted. Please try again." };

// Submits the signed-in candidate's application for the published job
// `jobSlug`. `stepData` is the apply flow's answers by stage; the files were
// uploaded first (uploadApplicationFiles). Returns { ok: true, reference }
// or { ok: false, error, captcha? } (captcha: the reCAPTCHA must be redone).
export async function submitApplication({ jobSlug, captchaToken, stepData, phone, resumePath, resumeName, documentPaths }) {
    const check = await verifyRecaptcha(captchaToken);
    if (!check.ok) return { ok: false, error: check.error, captcha: true };

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Your session has ended. Please sign in again, then submit." };

    if (typeof jobSlug !== "string" || !isPlainObject(stepData) || !ownPath(resumePath, user.id)) return FAILED;
    const documents = {};
    for (const [field, path] of Object.entries(isPlainObject(documentPaths) ? documentPaths : {})) {
        if (!DOCUMENT_FIELDS.has(field) || !ownPath(path, user.id)) return FAILED;
        documents[field] = path;
    }

    // Answers are stored as given (they're shown back, never executed), but
    // kept to a sane size.
    const answers = JSON.parse(JSON.stringify(stepData));
    if (JSON.stringify(answers).length > 150_000) return FAILED;

    const personal = isPlainObject(answers["personal-details"]) ? answers["personal-details"] : {};
    const firstName = text(personal.firstName, 100);
    const lastName = text(personal.lastName, 100);
    // The email field is locked to the account's address; the stored one
    // (and the copy in the answers) is always that, whatever was sent.
    const email = text(user.email, 254);
    if (isPlainObject(answers["personal-details"])) answers["personal-details"].email = email;
    if (!firstName || !lastName || !email) return { ok: false, error: "Your name and email are missing. Check Personal Details." };

    const { data: job } = await supabase
        .from("jobs")
        .select("id, title, department, location, type_of_work")
        .eq("slug", jobSlug)
        .eq("status", "published")
        .maybeSingle();
    if (!job) return { ok: false, error: "This job is no longer open for applications." };

    const { data, error } = await supabase
        .from("applications")
        .insert({
            job_id: job.id,
            candidate_id: user.id,
            first_name: firstName,
            last_name: lastName,
            email,
            phone: text(phone, 30),
            answers,
            resume_path: resumePath,
            resume_name: text(resumeName, 200) || "Resume",
            documents,
        })
        .select("reference")
        .single();

    if (error) {
        if (error.code === "23505") return { ok: false, error: "You have already applied for this job." };
        console.error("submitApplication:", error.code, error.message);
        return FAILED;
    }

    // The confirmation email goes out after the response, so the candidate
    // sees their reference straight away and a mail failure can't undo it.
    const origin = await requestOrigin();
    after(() =>
        sendQuietly("Application received", () =>
            // To the account's verified address, not the one typed in the
            // form, so the app can't be used to email arbitrary addresses.
            sendApplicationReceivedEmail({ email: user.email, firstName, reference: data.reference, job, origin }),
        ),
    );
    // sentTo: where the confirmation goes, named on the thank-you message.
    return { ok: true, reference: data.reference, sentTo: user.email };
}

// The signed-in candidate withdraws one of their open applications.
export async function withdrawApplication(applicationId) {
    if (typeof applicationId !== "string") return { ok: false, error: "Application not found." };
    const supabase = await createClient();
    const { error } = await supabase.rpc("withdraw_application", { application: applicationId });
    if (error) return { ok: false, error: "This application can no longer be withdrawn." };
    return { ok: true };
}

// The applications `ids` as they are before a status change, with what the
// stage email needs. Read first so only real moves send an email.
async function applicationsBeforeChange(supabase, ids) {
    const { data } = await supabase
        .from("applications")
        .select("id, status, reference, first_name, email, jobs(title, department, location)")
        .in("id", ids);
    return data ?? [];
}

// After the response, emails each candidate whose application really moved
// to `status`, when that stage emails (Job Offer, Onboarding, Rejected).
async function notifyStatusChange(before, updatedIds, status) {
    if (!STATUS_EMAIL_STATUSES.includes(status)) return;
    const updated = new Set(updatedIds);
    const moved = before.filter((row) => updated.has(row.id) && row.status !== status);
    if (moved.length === 0) return;
    const origin = await requestOrigin();
    after(async () => {
        // One at a time: each is a personal email, and the mail server
        // shouldn't be flooded by a large bulk move.
        for (const row of moved) {
            await sendQuietly(`Status (${status})`, () =>
                sendStatusChangeEmail({
                    email: row.email,
                    firstName: row.first_name,
                    reference: row.reference,
                    job: row.jobs,
                    status,
                    origin,
                }),
            );
        }
    });
}

// HR moves an application to another status. Job Offer, Onboarding and
// Rejected email the candidate.
export async function updateApplicationStatus(applicationId, status) {
    const session = await hrSession();
    if (!session) return { ok: false, error: "Only HR can change an application's status." };
    if (typeof applicationId !== "string" || !APPLICATION_STATUSES.includes(status)) {
        return { ok: false, error: "That status isn't valid." };
    }

    const before = await applicationsBeforeChange(session.supabase, [applicationId]);
    const { data, error } = await session.supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId)
        .select("id")
        .maybeSingle();
    if (error || !data) return { ok: false, error: "The status couldn't be changed. Please try again." };
    await notifyStatusChange(before, [data.id], status);
    return { ok: true };
}

// HR moves several applications to one status at once (the applicants list's
// bulk action). Withdrawn applications are the candidate's decision and are
// left as they are. Returns { ok, updated } with how many changed.
const MAX_BULK = 200;
export async function updateApplicationsStatus(applicationIds, status) {
    const session = await hrSession();
    if (!session) return { ok: false, error: "Only HR can change an application's status." };
    if (
        !Array.isArray(applicationIds) ||
        applicationIds.length === 0 ||
        applicationIds.length > MAX_BULK ||
        !applicationIds.every((id) => typeof id === "string" && id.length <= 64) ||
        !APPLICATION_STATUSES.includes(status)
    ) {
        return { ok: false, error: "That selection or status isn't valid." };
    }

    const ids = [...new Set(applicationIds)];
    const before = await applicationsBeforeChange(session.supabase, ids);
    const { data, error } = await session.supabase
        .from("applications")
        .update({ status })
        .in("id", ids)
        .neq("status", "withdrawn")
        .select("id");
    if (error) return { ok: false, error: "The statuses couldn't be changed. Please try again." };
    const updated = data.map((row) => row.id);
    await notifyStatusChange(before, updated, status);
    return { ok: true, updated };
}

// A short-lived link to an application's file (resume or a document), for HR
// or the candidate who uploaded it; Storage RLS decides which.
export async function applicationFileUrl(path) {
    if (typeof path !== "string" || path.length > 300 || path.includes("..")) return { ok: false };
    const supabase = await createClient();
    const { data, error } = await supabase.storage.from("applications").createSignedUrl(path, 300);
    if (error || !data) return { ok: false };
    return { ok: true, url: data.signedUrl };
}
