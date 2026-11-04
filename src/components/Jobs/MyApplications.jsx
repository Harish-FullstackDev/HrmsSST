"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import calendarIcon from "@/assets/Profile/icons/calendar.svg";
import clockIcon from "@/assets/Profile/icons/clock-meta.svg";
import pinIcon from "@/assets/Profile/icons/pin-meta.svg";
import videoCallIcon from "@/assets/Profile/icons/video-call.svg";
import videocamIcon from "@/assets/Profile/icons/videocam.svg";
import workIcon from "@/assets/Profile/icons/work-meta.svg";

import { withdrawApplication } from "@/lib/applications/actions";

// Hiring pipeline, in order (values match the application_status enum). An
// application at one of these stages is active; any other status (hired,
// rejected, withdrawn) has ended and moves it to the Withdrawn tab (as in the design).
const STAGES = [
    { value: "applied", label: "Application Received" },
    { value: "screening", label: "Screening" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "assessment", label: "Assessment" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offer", label: "Offer" },
];
const STAGE_INDEX = Object.fromEntries(STAGES.map(({ value }, index) => [value, index]));
const ENDED_LABELS = { hired: "Hired", rejected: "Not Selected", withdrawn: "Withdrawn" };

const TABS = [
    { key: "active", label: "Active" },
    { key: "withdrawn", label: "Withdrawn" },
];

const isActive = (application) => application.status in STAGE_INDEX;

function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Figma 2119:6361 icons, cut from the frame's export at their drawn size.
function Icon({ src }) {
    return <Image src={src} alt="" aria-hidden className="shrink-0" />;
}

const captionClass = "text-xs leading-[1.4]";

// Builds a one-event .ics file so "Add to Calendar" works with any calendar
// app. Needs the interview's start (and end) as ISO strings.
function downloadCalendarFile(interview, position) {
    const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Ascendus//HRMS Portal//EN",
        "BEGIN:VEVENT",
        `UID:${stamp(interview.start)}-${position.replace(/\W+/g, "-")}@hrms-portal`,
        `DTSTAMP:${stamp(new Date().toISOString())}`,
        `DTSTART:${stamp(interview.start)}`,
        `DTEND:${stamp(interview.end ?? interview.start)}`,
        `SUMMARY:Interview: ${interview.title} (${position})`,
        interview.link ? `LOCATION:${interview.link}` : null,
        "END:VEVENT",
        "END:VCALENDAR",
    ].filter(Boolean);
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
    const anchor = Object.assign(document.createElement("a"), { href: url, download: "interview.ics" });
    anchor.click();
    URL.revokeObjectURL(url);
}

// Figma "Overlay+Border": shown only when the application has an upcoming
// interview ({ title, when, link?, provider?, slot?, start?, end? }, from
// listMyApplications).
function InterviewPanel({ interview, position }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-x-[26px] gap-y-4 rounded-xl border border-card-border bg-surface-tint/70 p-5">
            <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-action">
                    <Icon src={videocamIcon} />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                    <p className={`${captionClass} text-action`}>
                        {interview.link ? `${interview.provider ?? "Meeting"} Link Ready` : "Interview Scheduled"}
                    </p>
                    <p className="text-lg leading-[1.2] font-medium text-ink-heading">
                        Upcoming Interview: {interview.title}
                    </p>
                    <p className={`${captionClass} text-[#464555]`}>{interview.when}</p>
                </div>
            </div>
            {(interview.link || interview.start) && (
                <div className="flex flex-wrap items-center gap-3">
                    {interview.link && (
                        <a
                            href={interview.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${captionClass} inline-flex items-center gap-2 rounded-lg bg-action px-4 py-2 text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#005192]`}
                        >
                            <Icon src={videoCallIcon} />
                            Join Meeting
                        </a>
                    )}
                    {interview.start && (
                        <button
                            type="button"
                            onClick={() => downloadCalendarFile(interview, position)}
                            className={`${captionClass} inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-card-border bg-white px-3 py-2 text-ink-heading transition-colors hover:bg-surface-tint`}
                        >
                            <Icon src={calendarIcon} />
                            Add to Calendar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Figma progress panel: current stage and count, the bar, then cleared / now /
// next. The middle item shows the booked slot when there is one
// (`interview.slot`, e.g. "Tomorrow, 2:00 PM").
function ProgressPanel({ stageIndex, interview }) {
    const previous = STAGES[stageIndex - 1];
    const next = STAGES[stageIndex + 1];

    return (
        <div className="flex flex-col gap-2 rounded-xl bg-surface-tint p-4">
            <div className={`${captionClass} flex items-center justify-between gap-4`}>
                <p className="text-ink-heading">{STAGES[stageIndex].label}</p>
                <p className="shrink-0 text-action">
                    Stage {stageIndex + 1} of {STAGES.length}
                </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-rail">
                <div
                    className="h-full rounded-full bg-action"
                    style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
                />
            </div>
            <div
                className={`${captionClass} flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-1 text-[#464555]`}
            >
                <p>{previous ? `Cleared: ${previous.label}` : "Just applied"}</p>
                <p className="text-action">
                    {interview?.slot ? `Scheduled: ${interview.slot}` : `Current: ${STAGES[stageIndex].label}`}
                </p>
                <p>{next ? `Next: ${next.label}` : "Final stage"}</p>
            </div>
        </div>
    );
}

// Figma 2119:6361 "Application 1": stage and Job ID pills, title, meta row,
// then the interview and progress panels, always open (no View Details).
// `application` comes from listMyApplications.
function ApplicationCard({ application, headingLevel: Title = "h2", onWithdraw }) {
    const { job } = application;
    const stageIndex = STAGE_INDEX[application.status] ?? -1;
    const active = stageIndex !== -1;
    const position = job?.title ?? "Position no longer listed";

    const location = job?.location ? `${job.location}${job.modeOfWork ? ` (${job.modeOfWork})` : ""}` : null;
    const department = job?.department;

    return (
        <article className="flex flex-col gap-6 rounded-2xl border border-card-border bg-[#f8f9fa] p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] sm:p-6">
            <div className="flex flex-col">
                <div className={`${captionClass} flex flex-wrap items-center gap-2 pb-2`}>
                    {active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1 text-success-500">
                            <span className="size-2 shrink-0 rounded-full bg-success-500" aria-hidden />
                            Stage {stageIndex + 1} of {STAGES.length}: {STAGES[stageIndex].label}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-muted-ink">
                            <span className="size-2 shrink-0 rounded-full bg-muted-ink" aria-hidden />
                            {ENDED_LABELS[application.status] ?? application.status}
                        </span>
                    )}
                    {job?.jobCode && (
                        <span className="rounded-full bg-surface-tint px-2.5 py-1 text-muted-ink">Job ID: {job.jobCode}</span>
                    )}
                </div>

                <Title className="text-xl leading-[1.2] font-medium capitalize text-ink-heading sm:text-2xl">
                    {job ? (
                        <Link href={`/jobs/${job.slug}`} className="transition-colors hover:text-action">
                            {position}
                        </Link>
                    ) : (
                        position
                    )}
                </Title>

                <div className={`${captionClass} flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-[#464555]`}>
                    {location && (
                        <span className="flex items-center gap-1.5">
                            <Icon src={pinIcon} />
                            {location}
                        </span>
                    )}
                    {department && (
                        <span className="flex items-center gap-1.5">
                            <Icon src={workIcon} />
                            {department}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <Icon src={clockIcon} />
                        Applied on {formatDate(application.appliedAt)}
                    </span>
                </div>
            </div>

            {active && application.interview && (
                <InterviewPanel interview={application.interview} position={position} />
            )}
            {active && <ProgressPanel stageIndex={stageIndex} interview={application.interview} />}

            {/* Not in Figma: kept so an application can still be withdrawn. */}
            {active && (
                <button
                    type="button"
                    onClick={() => {
                        if (window.confirm(`Withdraw your application for ${position}?`)) onWithdraw();
                    }}
                    className={`${captionClass} -mt-2 cursor-pointer self-start text-muted-ink underline-offset-4 transition-colors hover:text-action hover:underline`}
                >
                    Withdraw application
                </button>
            )}
        </article>
    );
}

// Ref "active.png": Active / Withdrawn tabs on a white bar under the header,
// then one full-width card per application. `applications` come from
// listMyApplications, loaded on the server.
// `embedded` (My Profile, Figma 2119:6361): the page has its own heading and
// margins; the tabs sit 12 above a grey rule, the open one in blue.
export default function MyApplications({ applications, embedded = false }) {
    const router = useRouter();
    const [tab, setTab] = useState("active");
    const [error, setError] = useState("");

    const visible = applications.filter((application) => isActive(application) === (tab === "active"));

    const withdraw = async (id) => {
        setError("");
        const result = await withdrawApplication(id);
        if (!result.ok) setError(result.error);
        router.refresh();
    };

    return (
        <>
            <div
                className={
                    embedded
                        ? "sticky top-0 z-10 border-b border-border-default bg-white py-3"
                        : "w-full bg-white px-4 shadow-[0px_4px_8px_rgba(0,0,0,0.06)] sm:px-16"
                }
            >
                {!embedded && <h1 className="sr-only">My Applications</h1>}
                <div role="tablist" className={`flex items-center ${embedded ? "gap-6" : "gap-8"}`}>
                    {TABS.map((item) => {
                        const selected = item.key === tab;
                        return (
                            <button
                                key={item.key}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                onClick={() => setTab(item.key)}
                                className={`cursor-pointer text-lg leading-[1.2] transition-colors ${embedded
                                        ? selected
                                            ? "font-medium text-action"
                                            : "font-medium text-muted-ink hover:text-ink-secondary"
                                        : `border-b-2 px-1 py-4 ${selected
                                            ? "border-ink font-medium text-ink"
                                            : "border-transparent text-border-strong hover:text-ink-secondary"}`
                                    }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <section className={embedded ? "w-full pt-8" : "w-full px-4 pt-8 pb-16 sm:px-16"}>
                {error && (
                    <p role="alert" className="mb-6 rounded-lg border border-required bg-[#fdf2f2] px-4 py-3 text-sm leading-5 text-required">
                        {error}
                    </p>
                )}
                {visible.length === 0 ? (
                    <div className="flex flex-col items-start gap-4 py-6">
                        <p className="text-base leading-[1.5] text-ink-secondary">
                            {tab === "active" ? "You have no active applications." : "You have no withdrawn applications."}
                        </p>
                        {tab === "active" && (
                            <Link
                                href="/jobs"
                                className="inline-flex h-11 items-center rounded-lg bg-action px-6 text-base leading-[1.5] text-white transition-colors hover:bg-[#005192]"
                            >
                                Search Jobs
                            </Link>
                        )}
                    </div>
                ) : (
                    <ul className="flex flex-col gap-6">
                        {visible.map((application) => (
                            <li key={application.id}>
                                <ApplicationCard
                                    application={application}
                                    headingLevel={embedded ? "h3" : "h2"}
                                    onWithdraw={() => withdraw(application.id)}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
