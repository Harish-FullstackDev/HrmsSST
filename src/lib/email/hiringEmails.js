import { headers } from "next/headers";

import { emailButton, emailDetails, escapeHtml, renderHtml, send } from "./mailer";

// Emails for the hiring flow: the candidate's "application received"
// confirmation and the HR team's "job published" notice. Server code only;
// call these from a Server Action inside after() so a slow or failing mail
// server never holds up (or fails) the action itself.

// The site's address for links in the email, from the request that triggered
// it (Next checks a Server Action's Origin against its Host). Null when
// there isn't one; the email then has no button.
export async function requestOrigin() {
    const origin = (await headers()).get("origin");
    return origin && /^https?:\/\/[^/\s]+$/.test(origin) ? origin : null;
}

const formatDate = (iso) =>
    iso
        ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
              new Date(`${iso}T00:00:00Z`),
          )
        : "";

const nowInIndia = () =>
    new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    }).format(new Date());

const textDetails = (rows) =>
    rows
        .filter(([, value]) => value)
        .map(([label, value]) => `${label}: ${value}`)
        .join("\n");

// To the candidate, once their application is saved. `job` is a jobs row
// (title, department, location, type_of_work).
export async function sendApplicationReceivedEmail({ email, firstName, reference, job, origin }) {
    if (!email) return;
    const rows = [
        ["Reference", reference],
        ["Position", job.title],
        ["Department", job.department],
        ["Location", job.location],
        ["Employment type", job.type_of_work],
        ["Submitted", `${nowInIndia()} IST`],
    ];
    const link = origin ? `${origin}/my-profile` : null;
    const outro =
        "Our team reviews every application and will contact you if your profile matches the role. " +
        "You can follow its status or withdraw it from My Profile. If you didn't apply, reply to this email.";

    await send({
        to: email,
        subject: `Application received: ${job.title} (${reference})`,
        text:
            `Hi ${firstName},\n\n` +
            `Thank you for applying for ${job.title} at Support Studio Technologies. We have received your application.\n\n` +
            `${textDetails(rows)}\n\n` +
            `${link ? `Track your application: ${link}\n\n` : ""}${outro}`,
        html: renderHtml({
            title: "Application received",
            intro:
                `Hi ${escapeHtml(firstName)},<br><br>Thank you for applying for <strong>${escapeHtml(job.title)}</strong> at Support Studio Technologies. ` +
                "We have received your application.",
            middle: emailDetails(rows) + (link ? `<div style="padding-top:24px;">${emailButton(link, "Go to My Profile")}</div>` : ""),
            outro,
        }),
        devLine: `application-received email to ${email} for ${reference} (${job.title})`,
    });
}

// To every HR account (BCC), when a job goes live on the careers site.
// `job` is a jobs row; `publishedBy` is the HR profile that published it.
export async function sendJobPublishedEmail({ recipients, job, publishedBy, origin }) {
    if (recipients.length === 0) return;
    const by = [publishedBy?.first_name, publishedBy?.last_name].filter(Boolean).join(" ") || publishedBy?.email || "";
    const rows = [
        ["Job ID", job.job_code],
        ["Position", job.title],
        ["Department", job.department],
        ["Location", job.location],
        ["Employment type", job.type_of_work],
        ["Work mode", job.mode_of_work],
        ["Openings", job.vacancies ? String(job.vacancies) : ""],
        ["Closes on", formatDate(job.closes_on)],
        ["Published by", by],
        ["Published", `${nowInIndia()} IST`],
    ];
    const jobLink = origin && job.slug ? `${origin}/jobs/${encodeURIComponent(job.slug)}` : null;
    const hrLink = origin ? `${origin}/hr/job-openings` : null;
    const outro = "You're receiving this because you have an HR account on the SST Careers Portal.";

    await send({
        bcc: recipients,
        subject: `Job published: ${job.title} (${job.job_code})`,
        text:
            `${job.title} (${job.job_code}) is now live on the careers site and taking applications.\n\n` +
            `${textDetails(rows)}\n\n` +
            `${jobLink ? `View the posting: ${jobLink}\n` : ""}${hrLink ? `Manage job openings: ${hrLink}\n` : ""}\n${outro}`,
        html: renderHtml({
            title: "Job published",
            intro: `<strong>${escapeHtml(job.title)}</strong> (${escapeHtml(job.job_code)}) is now live on the careers site and taking applications.`,
            middle:
                emailDetails(rows) +
                (jobLink ? `<div style="padding-top:24px;">${emailButton(jobLink, "View Posting")}</div>` : "") +
                (hrLink
                    ? `<div style="padding-top:12px;font-size:13px;"><a href="${escapeHtml(hrLink)}" style="color:#0061af;">Manage job openings</a></div>`
                    : ""),
            outro,
        }),
        devLine: `job-published email to ${recipients.length} HR account(s) for ${job.job_code} (${job.title})`,
    });
}

// What each stage email says. Only the moves HR confirms (Job Offer,
// Onboarding, Rejected) email the candidate.
const STATUS_EMAILS = {
    offer: {
        subject: (job) => `Job offer: ${job.title}`,
        title: "You've been selected for an offer",
        body: (job) =>
            `Good news: your application for ${job.title} at Support Studio Technologies has moved to the job offer stage. ` +
            "Our HR team will contact you shortly with the offer details and next steps.",
    },
    hired: {
        subject: (job) => `Welcome aboard: ${job.title}`,
        title: "Your onboarding has started",
        body: (job) =>
            `Congratulations! Your application for ${job.title} at Support Studio Technologies has moved to onboarding. ` +
            "Our HR team will be in touch with your joining details and the documents to prepare.",
    },
    rejected: {
        subject: (job) => `Update on your application: ${job.title}`,
        title: "Update on your application",
        body: (job) =>
            `Thank you for your interest in ${job.title} at Support Studio Technologies and for the time you gave to the process. ` +
            "After careful review, we won't be moving forward with your application for this role. " +
            "We encourage you to apply for other openings that match your profile.",
    },
};
export const STATUS_EMAIL_STATUSES = Object.keys(STATUS_EMAILS);

// To the candidate, when HR moves their application to a stage in
// STATUS_EMAILS. `job` is a jobs row (title, department, location).
export async function sendStatusChangeEmail({ email, firstName, reference, job, status, origin }) {
    const copy = STATUS_EMAILS[status];
    if (!email || !copy || !job) return;
    const rows = [
        ["Reference", reference],
        ["Position", job.title],
        ["Department", job.department],
        ["Location", job.location],
    ];
    const link = origin ? `${origin}/my-profile` : null;
    const outro = "If you have any questions, reply to this email.";
    const body = copy.body(job);

    await send({
        to: email,
        subject: `${copy.subject(job)} (${reference})`,
        text:
            `Hi ${firstName},\n\n${body}\n\n${textDetails(rows)}\n\n` +
            `${link ? `View your application: ${link}\n\n` : ""}${outro}`,
        html: renderHtml({
            title: copy.title,
            intro: `Hi ${escapeHtml(firstName)},<br><br>${escapeHtml(body)}`,
            middle: emailDetails(rows) + (link ? `<div style="padding-top:24px;">${emailButton(link, "Go to My Profile")}</div>` : ""),
            outro,
        }),
        devLine: `${status} email to ${email} for ${reference} (${job.title})`,
    });
}

// Runs an email send without letting its failure reach the caller.
export async function sendQuietly(label, sendEmail) {
    try {
        await sendEmail();
    } catch (error) {
        console.error(`${label} email failed:`, error);
    }
}
