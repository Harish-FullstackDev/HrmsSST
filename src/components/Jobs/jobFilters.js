// Filter dropdowns of the job search (JobSearch), from the website's
// openPositionsFilters.js. Placeholder options until the categories are
// managed from the admin panel; several match values the `jobs` table uses
// today so the filters return results in the meantime.
//
// `field` is the key on a mapped job (mapJob in src/lib/jobs.js) the filter
// matches. `width` is the Figma width (1619:11378) plus 10px, since Switzer
// renders the labels a touch wider and "Location" would otherwise truncate.
export const JOB_FILTERS = [
    {
        key: "location",
        label: "Location",
        field: "location",
        width: "w-[122px]",
        options: ["Riyadh, KSA", "Dubai, UAE", "Chennai, India", "Hybrid", "Remote"],
    },
    {
        key: "experience",
        label: "Experience Level",
        field: "experienceLevel",
        width: "w-[186px]",
        options: ["Fresher", "1 - 4 Years", "2 - 5 Years", "3 - 8 Years", "Expertise"],
    },
    {
        key: "workType",
        label: "Work Type",
        field: "typeOfWork",
        width: "w-[137px]",
        options: ["Full-time", "Part-time", "Contract", "Internship"],
    },
];
