"use client";

import Image from "next/image";
import { useState } from "react";

import calendarIcon from "@/assets/HrInterviews/icons/calendar-16.svg";
import {
    ALL,
    ALL_TIME,
    ANY_DATE,
    HrDateMenu,
    HrFilterMenu,
    HrListFooter,
    HrPeriodMenu,
    HrSearchField,
    HrSortMenu,
    hrRowLine,
    paginate,
    useTopSearch,
    withinDates,
} from "@/components/HrCommon/HrListControls";
import { EMPLOYMENT_TYPES, initialsOf } from "@/components/HrApplicants/applicantsData";
import { INTERVIEW_MODES, INTERVIEW_STATUSES, formatInterviewTime } from "./interviewData";

const PAGE_SIZE = 5;

const statusFor = Object.fromEntries(INTERVIEW_STATUSES.map((status) => [status.value, status]));

const SORTS = {
    soonest: { label: "Soonest first", compare: (a, b) => a.scheduledAt.localeCompare(b.scheduledAt) },
    latest: { label: "Latest first", compare: (a, b) => b.scheduledAt.localeCompare(a.scheduledAt) },
    "name-asc": { label: "Name A–Z", compare: (a, b) => a.name.localeCompare(b.name) },
    "name-desc": { label: "Name Z–A", compare: (a, b) => b.name.localeCompare(a.name) },
};

// Space on the right shared by the View Calendar button and the status
// pills, so the pills line up under the button (Figma: both 64 from the edge).
const rightColumn = "mr-4 w-[145px] shrink-0 sm:mr-16";

// Name, then the role after a dot; under them the interview, interviewer,
// time and mode, dot-separated. 12px slate text, as in Figma.
function InterviewRow({ interview }) {
    const status = statusFor[interview.status];
    const mode = INTERVIEW_MODES[interview.mode] ?? interview.mode;
    const details = [interview.title, interview.interviewer, formatInterviewTime(interview.scheduledAt)].filter(Boolean);

    return (
        <li className={`flex min-h-[73px] items-center gap-4 py-3 pl-6 ${hrRowLine}`}>
            <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary-200 bg-primary-100 text-sm leading-[1.4] text-navy-900"
            >
                {initialsOf(interview.name || "?")}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-sm leading-[1.4] text-ink">{interview.name}</span>
                    {interview.role && <span className="text-xs leading-[1.4] text-border-strong">· {interview.role}</span>}
                </p>
                <p className="flex flex-wrap items-center gap-x-2 text-xs leading-[1.4] text-border-strong">
                    {details.map((detail, index) => (
                        <span key={index} className="flex items-center gap-2">
                            {index > 0 && <span aria-hidden="true" className="text-slate-muted">·</span>}
                            {detail}
                        </span>
                    ))}
                    <span className="flex items-center gap-2">
                        <span aria-hidden="true" className="text-slate-muted">·</span>
                        {interview.meetingLink && interview.status === "scheduled" ? (
                            <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="text-action hover:underline">
                                {mode}
                            </a>
                        ) : (
                            mode
                        )}
                    </span>
                </p>
            </div>
            <div className={rightColumn}>
                <span
                    className={`inline-flex h-[26px] items-center rounded-full border px-2.5 text-xs leading-[1.4] whitespace-nowrap ${status?.pill ?? ""}`}
                >
                    {status?.label ?? interview.status}
                </span>
            </div>
        </li>
    );
}

// Figma "Interview Schedule": a search and period bar, then a grey card with
// the title and filters over a white list of interviews under an "Upcoming
// Interviews" bar, and the pagination on the card. On desktop the page fits
// the screen; only the list scrolls if it has to. `interviews` come from
// listInterviewsForHr.
export default function InterviewSchedule({ interviews }) {
    const [query, setQuery] = useState("");
    const topSearch = useTopSearch();
    const [status, setStatus] = useState(ALL);
    const [sort, setSort] = useState("soonest");
    const [role, setRole] = useState(ALL);
    const [type, setType] = useState(ALL);
    const [dateRange, setDateRange] = useState(ANY_DATE);
    const [period, setPeriod] = useState(ALL_TIME);
    const [page, setPage] = useState(1);

    // Any change to what's listed goes back to page 1.
    const refilter = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const roles = [...new Set(interviews.map((interview) => interview.role).filter(Boolean))].sort();
    const matches = (needle) => (interview) =>
        !needle ||
        [interview.name, interview.email, interview.role, interview.title, interview.interviewer].some((text) =>
            text.toLowerCase().includes(needle),
        );
    const listed = interviews
        .filter(
            (interview) =>
                matches(query.trim().toLowerCase())(interview) &&
                matches(topSearch)(interview) &&
                (status === ALL || interview.status === status) &&
                (role === ALL || interview.role === role) &&
                (type === ALL || interview.type === type) &&
                withinDates(interview.scheduledOn, dateRange, period),
        )
        .sort(SORTS[sort].compare);
    const paged = paginate(listed, page, PAGE_SIZE);

    return (
        <div className="flex flex-col gap-8 px-4 pt-8 pb-8 sm:px-8 lg:h-[calc(100dvh-83px)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <HrSearchField label="Search interviews" value={query} onChange={refilter(setQuery)} />
                <HrPeriodMenu value={period} onChange={refilter(setPeriod)} />
            </div>

            <section
                aria-labelledby="interviews-title"
                className="flex flex-col gap-8 rounded-[18px] border border-neutral-100 bg-[#f8f8f8] px-4 pt-5 pb-[18px] sm:px-[30px] lg:min-h-0 lg:flex-1"
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 id="interviews-title" className="text-xl leading-[1.2] font-medium text-[#16161a]">
                        Interview Schedule <span className="font-normal text-muted-ink">({listed.length.toLocaleString("en-US")})</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <HrSortMenu sorts={SORTS} value={sort} onChange={refilter(setSort)} />
                        <HrFilterMenu
                            label="Filter by status"
                            placeholder="Status"
                            options={[{ value: ALL, label: "All statuses" }, ...INTERVIEW_STATUSES]}
                            value={status}
                            onChange={refilter(setStatus)}
                        />
                        <HrFilterMenu
                            label="Filter by role"
                            placeholder="Role"
                            options={[{ value: ALL, label: "All roles" }, ...roles.map((value) => ({ value, label: value }))]}
                            value={role}
                            onChange={refilter(setRole)}
                        />
                        <HrDateMenu value={dateRange} onChange={refilter(setDateRange)} />
                        <HrFilterMenu
                            label="Filter by employment type"
                            placeholder="Employment Type"
                            options={[{ value: ALL, label: "All types" }, ...EMPLOYMENT_TYPES.map((value) => ({ value, label: value }))]}
                            value={type}
                            onChange={refilter(setType)}
                            className="min-w-[185px]"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1">
                    {/* The grey bar stays put; only the interviews under it scroll. */}
                    <div className="flex flex-col overflow-hidden rounded-t-lg bg-white lg:min-h-0 lg:flex-1">
                        {/* Same scrollbar gutter as the list, so the button
                            and the status pills line up. */}
                        <div className="flex h-[52px] shrink-0 items-center justify-between gap-4 overflow-hidden bg-neutral-200 pl-[27px] [scrollbar-gutter:stable]">
                            <h2 className="text-sm leading-[1.4] font-normal text-[#555555]">Upcoming Interviews</h2>
                            <div className={rightColumn}>
                                {/* The calendar view isn't designed yet. */}
                                <button
                                    type="button"
                                    disabled
                                    title="Calendar view coming soon"
                                    className="flex h-[34px] w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-[#233352] bg-[#16233e] text-sm leading-[1.4] text-[#e2e8f0]"
                                >
                                    <Image src={calendarIcon} alt="" width={16} height={16} />
                                    View Calendar
                                </button>
                            </div>
                        </div>
                        <ul className="overflow-y-auto [scrollbar-gutter:stable] lg:min-h-0 lg:flex-1">
                            {paged.pageRows.map((interview) => (
                                <InterviewRow key={interview.id} interview={interview} />
                            ))}
                        </ul>
                        {paged.pageRows.length === 0 && (
                            <p className="px-6 py-10 text-center text-sm leading-[1.4] text-muted-ink">
                                {interviews.length === 0 ? "No interviews scheduled yet." : "No interviews match these filters."}
                            </p>
                        )}
                    </div>
                    <HrListFooter paged={paged} total={listed.length} onPageChange={setPage} />
                </div>
            </section>
        </div>
    );
}
