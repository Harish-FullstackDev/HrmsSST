import JobSectionAccordion from "@/components/JobDetails/JobSectionAccordion";

// Figma 1380:3001: left column, max 738 wide. Summary (title, 16, body),
// then the section accordions, 24 apart.
export default function JobOverview({ summary, sections }) {
    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg leading-[1.2] font-medium text-ink">Job Summary</h2>
                <p className="text-sm leading-5 text-ink-secondary">{summary}</p>
            </div>
            {sections.map(({ title, items }) => (
                <JobSectionAccordion key={title} title={title} items={items} />
            ))}
        </div>
    );
}
