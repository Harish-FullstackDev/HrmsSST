// The HR Create Job form's options and checks, shared by the form (to show
// errors as HR types) and the saveJob Server Action (which never trusts the
// browser). Plain module: no "use client" / "use server".

export const DEPARTMENTS = ["Design", "Engineering", "Marketing", "Sales", "Product", "Human Resources", "Finance", "Operations"];
export const EMPLOYMENT_TYPES = ["Full-time", "Contract", "Internship"];
export const WORK_MODES = ["On-site", "Hybrid", "Remote"];
export const EXPERIENCE_LEVELS = ["Fresher", "Experienced"];

export const MAX_JOB_SKILLS = 5;
export const MAX_LIST_ITEMS = 20;
export const MAX_OPENINGS = 999;

export const emptyJob = {
    title: "",
    department: "",
    employmentType: "Full-time",
    workMode: "On-site",
    openings: 1,
    summary: "",
    location: "",
    responsibilities: [""],
    qualifications: [""],
    notes: [""],
    closingDate: "",
    experienceLevel: "Fresher",
    minYears: "",
    skills: [],
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HAS_LETTER = /\p{L}/u;
// How far ahead a closing date may be.
export const MAX_DAYS_OPEN = 365;

const filled = (items) => (Array.isArray(items) ? items.map((item) => String(item).trim()).filter(Boolean) : []);
// filled(), with each entry capitalised (for the lists HR writes).
const filledSentences = (items) => filled(items).map((item) => capitalizeFirst(item));

// A real calendar date (rejects 2026-02-30 and 2026-13-01), as an ISO string.
const isRealDate = (iso) => {
    if (!ISO_DATE.test(iso)) return false;
    const date = new Date(`${iso}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso;
};

// `iso` plus `days`, as an ISO date.
const addDays = (iso, days) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

const hasDuplicates = (items) => new Set(items.map((item) => item.toLowerCase())).size !== items.length;

const isBlank = (value) => value === "" || value == null;

// Capitalises the first letter of the text ("pondy (Hybrid)" becomes "Pondy
// (Hybrid)"), leaving the rest as typed. Used on the free-text fields as HR
// types and again when saving.
export const capitalizeFirst = (text) => String(text ?? "").replace(/^(\s*)(\p{Ll})/u, (_, space, letter) => space + letter.toUpperCase());

// Returns { field: message } for every invalid field; empty when valid.
// A draft only needs a title, but whatever else it has filled in must still
// be valid (the database would refuse it otherwise); publishing needs every
// field. `today` is an ISO date, passed in so callers decide when "today" is
// read.
export function validateJob(values, { publish, today }) {
    const errors = {};
    const title = String(values.title ?? "").trim();
    if (title.length < 2 || title.length > 120 || !HAS_LETTER.test(title)) errors.title = "Enter a job title (2–120 characters).";
    const closingDate = isBlank(values.closingDate) ? "" : String(values.closingDate);
    if (closingDate && !isRealDate(closingDate)) errors.closingDate = "Pick a valid date.";

    if (publish) {
        if (!DEPARTMENTS.includes(values.department)) errors.department = "Select a department.";
        if (!EMPLOYMENT_TYPES.includes(values.employmentType)) errors.employmentType = "Select an employment type.";
        if (!WORK_MODES.includes(values.workMode)) errors.workMode = "Select a work mode.";
        if (!EXPERIENCE_LEVELS.includes(values.experienceLevel)) errors.experienceLevel = "Select an experience level.";
    }

    if (publish || !isBlank(values.openings)) {
        const openings = Number(values.openings);
        if (isBlank(values.openings) || !Number.isInteger(openings) || openings < 1 || openings > MAX_OPENINGS) {
            errors.openings = "Enter 1 to 999 openings.";
        }
    }

    const summary = String(values.summary ?? "").trim();
    if (summary.length > 3000 || (publish && summary.length < 20)) errors.summary = "Write a summary of 20 to 3000 characters.";
    const location = String(values.location ?? "").trim();
    if ((publish || location) && (location.length < 2 || location.length > 120 || !HAS_LETTER.test(location))) {
        errors.location = "Enter the job location.";
    }

    // Notes are optional: an empty list is fine even when publishing.
    for (const field of ["responsibilities", "qualifications", "notes"]) {
        const items = filled(values[field]);
        if (items.length === 0) {
            if (publish && field !== "notes") errors[field] = "Add at least one.";
        } else if (items.length > MAX_LIST_ITEMS) errors[field] = `Add at most ${MAX_LIST_ITEMS}.`;
        else if (items.some((item) => item.length > 300)) errors[field] = "Keep each one under 300 characters.";
        else if (items.some((item) => item.length < 3)) errors[field] = "Each one needs at least 3 characters.";
        else if (hasDuplicates(items)) errors[field] = "Remove the repeated entry.";
    }

    if (publish && !errors.closingDate) {
        if (!closingDate) errors.closingDate = "Pick a closing date.";
        else if (closingDate < today) errors.closingDate = "The closing date can't be in the past.";
        else if (closingDate > addDays(today, MAX_DAYS_OPEN)) errors.closingDate = "Pick a date within the next year.";
    }

    if (values.experienceLevel === "Experienced" && (publish || !isBlank(values.minYears))) {
        const years = Number(values.minYears);
        if (isBlank(values.minYears) || !Number.isInteger(years) || years < 1 || years > 50) {
            errors.minYears = "Enter the minimum years (1–50).";
        }
    }

    const skills = filled(values.skills);
    if (skills.length === 0) {
        if (publish) errors.skills = "Add at least one skill.";
    } else if (skills.length > MAX_JOB_SKILLS || skills.some((skill) => skill.length > 50)) errors.skills = "Check the skills.";

    return errors;
}

// Form values to a jobs row (snake_case, lists cleaned).
export function jobRow(values) {
    const experienced = values.experienceLevel === "Experienced";
    return {
        title: capitalizeFirst(String(values.title ?? "").trim()),
        department: DEPARTMENTS.includes(values.department) ? values.department : "",
        type_of_work: EMPLOYMENT_TYPES.includes(values.employmentType) ? values.employmentType : "Full-time",
        mode_of_work: WORK_MODES.includes(values.workMode) ? values.workMode : "",
        // Number(), as validateJob reads it ("1e2" is 100 in both).
        vacancies: Number.isInteger(Number(values.openings)) ? Math.min(MAX_OPENINGS, Math.max(1, Number(values.openings))) : 1,
        about_job: capitalizeFirst(String(values.summary ?? "").trim().slice(0, 3000)),
        location: capitalizeFirst(String(values.location ?? "").trim().slice(0, 120)),
        responsibilities: filledSentences(values.responsibilities).slice(0, MAX_LIST_ITEMS),
        qualifications: filledSentences(values.qualifications).slice(0, MAX_LIST_ITEMS),
        notes: filledSentences(values.notes).slice(0, MAX_LIST_ITEMS),
        closes_on: isRealDate(values.closingDate ?? "") ? values.closingDate : null,
        experience_level: EXPERIENCE_LEVELS.includes(values.experienceLevel) ? values.experienceLevel : "",
        min_experience_years: experienced && !isBlank(values.minYears) && Number.isInteger(Number(values.minYears)) ? Number(values.minYears) : null,
        skills: filled(values.skills).slice(0, MAX_JOB_SKILLS),
    };
}

// A jobs row back to form values, for editing.
export function jobValues(row) {
    const list = (items) => (items?.length ? items : [""]);
    return {
        title: row.title ?? "",
        department: row.department ?? "",
        employmentType: row.type_of_work || "Full-time",
        workMode: row.mode_of_work || "On-site",
        openings: row.vacancies ?? 1,
        summary: row.about_job ?? "",
        location: row.location ?? "",
        responsibilities: list(row.responsibilities),
        qualifications: list(row.qualifications),
        notes: list(row.notes),
        closingDate: row.closes_on ?? "",
        experienceLevel: row.experience_level || "Fresher",
        minYears: row.min_experience_years == null ? "" : String(row.min_experience_years),
        skills: row.skills ?? [],
    };
}

// Today in India (where SST hires), as an ISO date.
export const todayIso = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
