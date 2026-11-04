// The six stages of a job application, in order. Each stage is a route under
// /apply/<slug>. Labels follow Figma 1878:19452.
export const applySteps = [
    { slug: "upload-resume", label: "Upload Resume" },
    { slug: "personal-details", label: "Personal Details" },
    { slug: "experience-and-education", label: "Education and Experience" },
    { slug: "skills-and-certifications", label: "Skills and Certifications" },
    { slug: "upload-documents", label: "Upload Documents" },
    { slug: "review-and-submit", label: "Review and Submit" },
];

export const applyStepHref = (index) => `/apply/${applySteps[index].slug}`;
