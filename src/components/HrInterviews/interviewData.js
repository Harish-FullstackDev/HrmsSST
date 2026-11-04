// Labels for the HR Interview Schedule. The interviews come from the database
// (listInterviewsForHr in src/lib/applications/queries.js).

// Values match the interview_status enum; `pill` styles the status pill.
export const INTERVIEW_STATUSES = [
    { value: "scheduled", label: "Scheduled", pill: "border-primary-200 bg-[#e3eefb] text-action" },
    { value: "completed", label: "Completed", pill: "border-[#95c6a9] bg-success-100 text-success-500" },
    { value: "cancelled", label: "Cancelled", pill: "border-error-200 bg-error-100 text-required" },
    { value: "no_show", label: "No Show", pill: "border-warning-200 bg-warning-100 text-warning-600" },
];

// Values match the interview_mode enum.
export const INTERVIEW_MODES = { online: "Online", in_person: "In person", phone: "Phone" };

// "27 Oct, 11:09". Interviews are held on India time, and fixing the zone
// keeps the server and the browser printing the same thing.
const whenFormat = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
});

export function formatInterviewTime(timestamp) {
    const parts = Object.fromEntries(whenFormat.formatToParts(new Date(timestamp)).map(({ type, value }) => [type, value]));
    return `${parts.day} ${parts.month}, ${parts.hour}:${parts.minute}`;
}
