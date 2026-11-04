// Labels for the HR job openings list. The jobs themselves come from the
// database (listJobsForHr in src/lib/applications/queries.js).

// The status filter lists these in this order (values match the job_status
// enum); `swatch` colours the square beside the status in the table.
export const JOB_STATUSES = [
    { value: "published", label: "Published", swatch: "bg-success-500" },
    { value: "draft", label: "Draft", swatch: "bg-muted-ink" },
    { value: "on_hold", label: "On Hold", swatch: "bg-warning-500" },
    { value: "closed", label: "Closed", swatch: "bg-required" },
];

export { EMPLOYMENT_TYPES as JOB_TYPES } from "@/lib/jobs/jobForm";

// "Oct 29, 2026" from an ISO date. Read in UTC so the server and the browser
// print the same day.
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const formatPostedOn = (isoDate) => (isoDate ? dateFormat.format(new Date(`${isoDate}T00:00:00Z`)) : "");
