// Choices for the education-and-experience stage (Figma 1878:20839).

export const qualifications = ["Diploma", "Bachelor’s Degree", "Master’s Degree", "Others"];

// Picking this (always last in the degree and field-of-study lists) lets the
// candidate type an answer that isn't listed.
export const OTHER_OPTION = "Other";

// Degree choices for each qualification. With no qualification picked yet,
// every listed degree shows.
const DEGREES_BY_QUALIFICATION = {
    Diploma: ["Diploma in Engineering", "Diploma in Computer Applications", "Diploma in Design", "Diploma in Management"],
    "Bachelor’s Degree": ["B.Tech", "B.E.", "B.Sc", "BCA", "B.Com", "BBA", "B.A.", "B.Des", "B.Arch"],
    "Master’s Degree": ["M.Tech", "M.E.", "M.Sc", "MCA", "M.Com", "MBA", "M.A.", "M.Des"],
    Others: [],
};
export const degreesFor = (qualification) => [
    ...(DEGREES_BY_QUALIFICATION[qualification] ?? Object.values(DEGREES_BY_QUALIFICATION).flat()),
    OTHER_OPTION,
];

export const fieldsOfStudy = [
    "Computer Science",
    "Information Technology",
    "Electronics and Communication",
    "Electrical and Electronics",
    "Mechanical Engineering",
    "Civil Engineering",
    "Data Science",
    "Design",
    "Business Administration",
    "Commerce",
    "Economics",
    "Finance",
    "Human Resources",
    "Marketing",
    "Mathematics",
    "Physics",
    "Chemistry",
    "English",
    OTHER_OPTION,
];

export const experienceLevels = ["Fresher", "1 to 2", "3 to 4", "5 to 8", "8+"];

export const yesNo = ["Yes", "No"];

export const noticePeriods = ["Immediate", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days", "More than 90 Days"];

export const shortenOptions = ["Yes", "No", "Not Sure"];

export const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const thisYear = new Date().getFullYear();
// Newest first: five years ahead (students) back to 1970.
export const graduationYears = Array.from({ length: thisYear + 5 - 1970 + 1 }, (_, i) => String(thisYear + 5 - i));
// Newest first: this year back to 1970.
export const workYears = graduationYears.filter((year) => Number(year) <= thisYear);

// Suggestions for the skills picker on the next stage.
export const skills = [
    "UI/UX",
    "Interaction design",
    "Visual design",
    "Layout",
    "Typography",
    "Design system",
    "Prototyping",
    "Wireframing",
    "User research",
    "Usability testing",
    "Information architecture",
    "Figma",
    "Accessibility",
    "Motion design",
    "Product strategy",
    "Design leadership",
    "Front-end development",
    "Manual testing",
];
