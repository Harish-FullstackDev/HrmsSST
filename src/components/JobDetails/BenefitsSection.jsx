import Image from "next/image";

import financialIcon from "@/assets/JobDetails/icons/financial-wellbeing-48.svg";
import healthIcon from "@/assets/JobDetails/icons/health-wellness-48.svg";
import briefcaseIcon from "@/assets/JobDetails/icons/briefcase-group.svg";
import balanceIcon from "@/assets/JobDetails/icons/work-life-balance-48.svg";

const benefits = [
    {
        icon: <Image src={financialIcon} alt="" width={48} height={48} />,
        // Figma breaks this title onto two lines by hand.
        title: "Financial\nwellbeing",
        body: "We regularly review market data to ensure compensation reflects the value you bring. Your benefits extend beyond pay and may include retirement plans, financial education, etc.",
    },
    {
        icon: <Image src={healthIcon} alt="" width={48} height={48} />,
        title: "Health and wellness",
        body: "Our comprehensive health plans support your physical and mental well-being, including access to fitness programs, counseling services, and wellness resources.",
    },
    {
        // heroicons briefcase: the glyph sits inset 5% / 10% / 10% / 10% in its 48 box.
        icon: (
            <span className="relative block size-12">
                <Image src={briefcaseIcon} alt="" width={38.4} height={40.8} className="absolute top-[5%] left-[10%]" />
            </span>
        ),
        title: "Professional development",
        body: "We provide opportunities for growth through workshops, mentorship programs, and funding for courses that align with your career goals.",
    },
    {
        icon: <Image src={balanceIcon} alt="" width={48} height={48} />,
        // Figma breaks this one by hand too.
        title: "Work-life\nbalance",
        body: "We promote a flexible work environment that includes remote work options, generous paid time off, and family leave to help you maintain a healthy balance.",
    },
];

// Figma 1380:3025: neutral band, heading block then four 262×353 white
// cards spread edge to edge (space-between) inside the 64 gutters. Each card
// keeps the icon at the top and pins the title + body group (16 apart, Figma
// 1447:15853) to the bottom of its fixed height. Two columns below xl, one
// on phones.
export default function BenefitsSection() {
    return (
        <section className="w-full bg-neutral-100">
            <div className="flex w-full flex-col gap-8 px-4 py-10 sm:px-16">
                <div className="flex max-w-[740px] flex-col gap-2">
                    <h2 className="text-2xl leading-[1.2] font-medium text-ink capitalize">
                        Benefits that help you thrive and grow
                    </h2>
                    <p className="text-sm leading-[1.4] text-ink-secondary">
                        Our benefits program is built with you in mind so you can enjoy a fulfilling, balanced and
                        healthy life.
                    </p>
                </div>

                <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-[repeat(4,262px)] xl:justify-between">
                    {benefits.map(({ icon, title, body }) => (
                        <li
                            key={title}
                            className="flex flex-col justify-between gap-6 bg-white px-6 py-8 xl:h-[353px] xl:gap-0"
                        >
                            {icon}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-2xl leading-[1.2] font-medium whitespace-pre-line text-ink capitalize">
                                    {title}
                                </h3>
                                <p className="text-sm leading-5 text-ink-secondary">{body}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
