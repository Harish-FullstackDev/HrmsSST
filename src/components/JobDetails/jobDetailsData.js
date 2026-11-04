// Static content for the job-details page until jobs come from the backend.
// Copy is Figma 1380:2917's, except the accordion bodies: the design shows
// every section collapsed, so their text is drafted and needs sign-off.
export const jobDetails = {
    title: "Senior Product Designer",
    reference: "000764697",
    status: "Actively Hiring",
    tags: ["Full-Time", "Hybrid", "Kochi, Kerala, India / Hybrid"],
    summary:
        "We are seeking a senior UX leader who guides delivery, supports pursuits, maintains project-level client relationships & mentors teams through selective hands-on design work. The role involves leading end-to-end UX initiatives, defining user-centric design strategies, collaborating with product and engineering teams, and ensuring user-centric design solutions that deliver business value. The ideal candidate will combine strong design leadership with strategic thinking, business acumen, and a deep understanding of user research and design best practices.",
    // Skills the candidate rates in the apply flow (Figma 1380:3598).
    roleSummary: [
        { label: "Department", value: "Product Design" },
        { label: "Location", value: "Kochi, Kerala, India / Hybrid" },
        { label: "Job Type", value: "Full-Time, Permanent" },
    ],
    sections: [
        {
            title: "Roles and Responsibilities",
            items: [
                "Lead end-to-end UX initiatives from discovery through delivery.",
                "Define user-centric design strategies with product and engineering teams.",
                "Maintain project-level client relationships and support pursuits.",
                "Mentor designers through reviews and selective hands-on design work.",
            ],
        },
        {
            title: "Job Description",
            items: [
                "Translate business goals and user research into clear design direction.",
                "Own the quality of design deliverables across concurrent projects.",
                "Champion design best practices and a consistent design system.",
            ],
        },
        {
            title: "Qualification",
            items: [
                "Degree in design, HCI or a related field, or equivalent experience.",
                "Proven experience leading UX for enterprise or client-facing products.",
                "Strong grounding in user research methods and interaction design.",
            ],
        },
        {
            // Figma spells it "Acsendus".
            title: "About Ascendus",
            items: [
                "Ascendus delivers technology and digital transformation services for organisations across the region.",
            ],
        },
        {
            title: "Important Notice",
            items: [
                "Ascendus never asks candidates for payment at any stage of the hiring process.",
            ],
        },
    ],
};
