// Labels for the HR applicants list (Figma 2060:2170). The applicants come
// from the database (listApplicationsForHr in src/lib/applications/queries.js).

// Every status an application can have (values match the
// application_status enum), in hiring order, with its swatch colour on the
// list. The side panel's stage menu offers all but "withdrawn", which only
// the candidate can choose.
export const APPLICANT_STATUSES = [
    { value: "applied", label: "Applied", swatch: "bg-primary-300" },
    { value: "screening", label: "Screening", swatch: "bg-warning-500" },
    { value: "shortlisted", label: "Shortlisted", swatch: "bg-primary-400" },
    { value: "assessment", label: "Assessment", swatch: "bg-muted-ink" },
    { value: "interviewing", label: "Interviewing", swatch: "bg-action" },
    { value: "offer", label: "Job Offer", swatch: "bg-info-500" },
    { value: "hired", label: "Onboarding", swatch: "bg-success-500" },
    { value: "rejected", label: "Rejected", swatch: "bg-required" },
    { value: "withdrawn", label: "Withdrawn", swatch: "bg-neutral-300" },
];

// Statuses HR can set (from the side panel or in bulk): not "applied", where
// every application starts, or "withdrawn", the candidate's own action.
const NOT_SETTABLE = new Set(["applied", "withdrawn"]);
export const SETTABLE_STATUSES = APPLICANT_STATUSES.filter((status) => !NOT_SETTABLE.has(status.value));

// Moves that matter to the candidate ask HR to confirm first: the copy for
// the confirmation, by status. `count` is how many applications; `who` is a
// name or "3 applicants".
export const CONFIRM_STATUS = {
    offer: {
        title: (count) => (count > 1 ? `Move ${count} applicants to Job Offer?` : "Move to Job Offer?"),
        confirmLabel: "Move to Job Offer",
        tone: "default",
        text: (who) => `${who} will move to the Job Offer stage and get an email about it.`,
    },
    hired: {
        title: (count) => (count > 1 ? `Start onboarding ${count} applicants?` : "Start onboarding?"),
        confirmLabel: "Move to Onboarding",
        tone: "default",
        text: (who) => `${who} will move to Onboarding and get an email about it.`,
    },
    rejected: {
        title: (count) => (count > 1 ? `Reject ${count} applications?` : "Reject this application?"),
        confirmLabel: "Reject",
        tone: "danger",
        text: (who) => `${who} will be marked Rejected and get an email about it.`,
    },
};

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export const initialsOf = (name) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

// "Oct 28, 2026". Read in UTC so the server and the browser print the same day.
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const formatAppliedOn = (isoDate) => dateFormat.format(new Date(`${isoDate}T00:00:00Z`));
