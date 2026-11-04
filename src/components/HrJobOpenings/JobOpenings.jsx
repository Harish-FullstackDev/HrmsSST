"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useState } from "react";

import moreIcon from "@/assets/HrJobOpenings/icons/more-20.svg";
import plusIcon from "@/assets/HrJobOpenings/icons/plus-white-18.svg";
import HrMenu from "@/components/HrCommon/HrMenu";
import JobFormDialog from "@/components/HrJobForm/JobFormDialog";
import { deleteJob, setJobStatus } from "@/lib/jobs/actions";
import {
    ALL,
    ALL_TIME,
    ANY_DATE,
    DATE_RANGE_OPTIONS,
    HrFilterPanel,
    HrListFooter,
    HrScrollTable,
    HrSortButton,
    HrStatus,
    dateRangeFor,
    hrCell,
    hrHeadCell,
    hrRowLine,
    paginate,
    useTopSearch,
    withinDates,
} from "@/components/HrCommon/HrListControls";
import { JOB_STATUSES, JOB_TYPES, formatPostedOn } from "./jobOpeningsData";

const PAGE_SIZE = 5;

const statusFor = Object.fromEntries(JOB_STATUSES.map((status) => [status.value, status]));

const SORTS = {
    newest: { label: "Newest first", compare: (a, b) => b.postedOn.localeCompare(a.postedOn) },
    oldest: { label: "Oldest first", compare: (a, b) => a.postedOn.localeCompare(b.postedOn) },
    applications: { label: "Most applications", compare: (a, b) => b.applications - a.applications },
    vacancies: { label: "Most vacancies", compare: (a, b) => b.vacancies - a.vacancies },
};

// The last column holds each row's ⋯ menu; its heading is for screen readers.
const COLUMNS = [
    { label: "Job ID", width: "w-[16.5%]" },
    { label: "Job Position and Dept", width: "w-[17.25%]" },
    { label: "Date Posted", width: "w-[12.25%]" },
    { label: "Type", width: "w-[9.5%]" },
    { label: "Vacancies", width: "w-[10.5%]" },
    { label: "Applications", width: "w-[13%]" },
    { label: "Status", width: "w-[14.5%]" },
    { label: "Actions", width: "w-[6.5%]", hidden: true },
];

// Figma "Job Opening": the title with Create Job, Filter and Sort on its
// right, then the table on white with the pagination on a grey strip under
// it, all in one light-bordered box. The top bar's search filters the list.
// On desktop the page fits the screen; only the rows scroll if they have to.
// Create Job and a job's title open the job form in a dialog (JobFormDialog);
// ?new=1 (the dashboard's Create Job link) opens it on arrival. `jobs` come
// from listJobsForHr.
export default function JobOpenings({ jobs }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = useTopSearch();
    // null, { mode: "create" }, or { mode: "edit" | "duplicate", id }.
    const [dialog, setDialog] = useState(() => (searchParams.get("new") === "1" ? { mode: "create" } : null));

    const closeDialog = () => {
        setDialog(null);
        // Drop ?new=1 so a reload doesn't open the form again.
        if (searchParams.get("new")) {
            const params = new URLSearchParams(searchParams);
            params.delete("new");
            const query = params.toString();
            window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
        }
    };

    // Next keeps this page mounted but hidden after navigating away; close the
    // dialog then, or it would still be open (and the page inert) on return.
    useLayoutEffect(() => () => setDialog(null), []);

    // The row menu's actions. One at a time; a failure shows above the table.
    const [busyId, setBusyId] = useState(null);
    const [actionError, setActionError] = useState("");
    const runAction = async (job, action) => {
        if (busyId) return;
        setActionError("");
        setBusyId(job.id);
        let result;
        try {
            result = await action();
        } catch {
            result = { ok: false, error: "That didn't work. Check your connection and try again." };
        }
        setBusyId(null);
        if (result.ok) {
            router.refresh();
            return;
        }
        setActionError(result.error);
        // A draft that isn't complete opens in the form to finish it.
        if (result.incomplete) setDialog({ mode: "edit", id: job.id });
    };

    const menuItems = (job) => [
        { label: "Edit", onSelect: () => setDialog({ mode: "edit", id: job.id }) },
        { label: "Duplicate", onSelect: () => setDialog({ mode: "duplicate", id: job.id }) },
        ...(job.status === "draft" ? [{ label: "Publish", onSelect: () => runAction(job, () => setJobStatus(job.id, "published")) }] : []),
        ...(job.status !== "closed"
            ? [
                  {
                      label: "Close",
                      onSelect: () => {
                          if (window.confirm(`Close ${job.title} (${job.code})? It will stop taking applications.`)) {
                              runAction(job, () => setJobStatus(job.id, "closed"));
                          }
                      },
                  },
              ]
            : []),
        {
            label: "Delete",
            onSelect: () => {
                if (job.applications > 0) {
                    setActionError(
                        `${job.title} (${job.code}) has ${job.applications} application${job.applications === 1 ? "" : "s"}, so it can't be deleted. Close it instead.`,
                    );
                } else if (window.confirm(`Delete ${job.title} (${job.code})? This can't be undone.`)) {
                    runAction(job, () => deleteJob(job.id));
                }
            },
        },
    ];

    const [status, setStatus] = useState(ALL);
    const [sort, setSort] = useState("newest");
    const [role, setRole] = useState(ALL);
    const [type, setType] = useState(ALL);
    const [dateRange, setDateRange] = useState(ANY_DATE);
    const [page, setPage] = useState(1);

    // Any change to what's listed goes back to page 1.
    const refilter = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const roles = [...new Set(jobs.map((job) => job.title))].sort();
    const listed = jobs
        .filter(
            (job) =>
                (!search || [job.code, job.title, job.department].some((text) => text.toLowerCase().includes(search))) &&
                (status === ALL || job.status === status) &&
                (role === ALL || job.title === role) &&
                (type === ALL || job.type === type) &&
                withinDates(job.postedOn, dateRange, ALL_TIME),
        )
        .sort(SORTS[sort].compare);
    const paged = paginate(listed, page, PAGE_SIZE);

    const filters = [
        {
            id: "status",
            label: "Status",
            options: [{ value: ALL, label: "All statuses" }, ...JOB_STATUSES],
            value: status,
            onChange: refilter(setStatus),
        },
        {
            id: "role",
            label: "Role",
            searchable: true,
            options: [{ value: ALL, label: "All roles" }, ...roles.map((value) => ({ value, label: value }))],
            value: role,
            onChange: refilter(setRole),
        },
        {
            id: "date",
            label: "Date posted",
            options: DATE_RANGE_OPTIONS,
            value: dateRange.label,
            onChange: (label) => refilter(setDateRange)(dateRangeFor(label)),
        },
        {
            id: "type",
            label: "Employment type",
            options: [{ value: ALL, label: "All types" }, ...JOB_TYPES.map((value) => ({ value, label: value }))],
            value: type,
            onChange: refilter(setType),
        },
    ];
    const clearFilters = () => {
        setStatus(ALL);
        setRole(ALL);
        setType(ALL);
        setDateRange(ANY_DATE);
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-8 px-4 pt-8 pb-8 sm:px-8 lg:h-[calc(100dvh-83px)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-xl leading-[1.2] font-medium text-[#16161a]">
                    Job Openings <span className="font-normal text-muted-ink">({listed.length.toLocaleString("en-US")})</span>
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() => setDialog({ mode: "create" })}
                        className="flex h-8 items-center gap-2 rounded bg-action px-3.5 text-sm leading-[1.4] whitespace-nowrap text-white transition-colors hover:bg-primary"
                    >
                        <Image src={plusIcon} alt="" width={18} height={18} />
                        Create Job
                    </button>
                    <HrFilterPanel filters={filters} onClear={clearFilters} />
                    <HrSortButton sorts={SORTS} value={sort} onChange={refilter(setSort)} />
                </div>
            </div>

            {actionError && (
                <p role="alert" className="rounded-lg border border-required bg-[#fdf2f2] px-4 py-3 text-sm leading-5 text-required">
                    {actionError}
                </p>
            )}

            <section
                aria-label="Job openings"
                className="flex flex-col overflow-hidden rounded-lg border border-neutral-100 bg-[#f8f8f8] lg:min-h-0 lg:flex-1"
            >
                <HrScrollTable
                    widths={COLUMNS.map(({ width }) => width)}
                    minWidth={960}
                    className="bg-white"
                    head={COLUMNS.map(({ label, hidden }) => (
                        <th key={label} scope="col" className={hrHeadCell}>
                            {hidden ? <span className="sr-only">{label}</span> : label}
                        </th>
                    ))}
                    empty={
                        paged.pageRows.length === 0 && (
                            <p className="px-6 py-10 text-center text-sm leading-[1.4] text-muted-ink">
                                {jobs.length === 0 ? "No jobs yet. Create the first one." : "No job openings match these filters."}
                            </p>
                        )
                    }
                >
                    {paged.pageRows.map((job) => (
                        <tr key={job.id} className={`h-[86px] ${hrRowLine}`}>
                            <td className="px-[18px] text-sm leading-[1.4] text-ink">{job.code}</td>
                            <td className={hrCell}>
                                <div className="flex flex-col gap-1">
                                    <button
                                        type="button"
                                        aria-haspopup="dialog"
                                        onClick={() => setDialog({ mode: "edit", id: job.id })}
                                        className="truncate text-left text-action hover:underline"
                                    >
                                        {job.title}
                                    </button>
                                    <span className="truncate text-[#555555]">{job.department}</span>
                                </div>
                            </td>
                            <td className={hrCell}>{formatPostedOn(job.postedOn)}</td>
                            <td className={hrCell}>{job.type}</td>
                            <td className={`${hrCell} tabular-nums`}>{String(job.vacancies).padStart(2, "0")}</td>
                            <td className={`${hrCell} tabular-nums`}>{job.applications}</td>
                            <td className={hrCell}>
                                <HrStatus swatch={statusFor[job.status]?.swatch}>{statusFor[job.status]?.label ?? job.status}</HrStatus>
                            </td>
                            <td className="pr-4 text-right">
                                <HrMenu
                                    label={`More options for ${job.title} (${job.code})`}
                                    items={menuItems(job)}
                                    menuClassName="min-w-[140px]"
                                    className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-neutral-200 disabled:opacity-40"
                                >
                                    {busyId === job.id ? (
                                        <span
                                            aria-hidden="true"
                                            className="size-4 animate-spin rounded-full border-2 border-action border-t-transparent"
                                        />
                                    ) : (
                                        <Image src={moreIcon} alt="" width={20} height={20} />
                                    )}
                                </HrMenu>
                            </td>
                        </tr>
                    ))}
                </HrScrollTable>
                <HrListFooter
                    paged={paged}
                    total={listed.length}
                    onPageChange={setPage}
                    className="border-t border-neutral-100 px-6 py-4"
                />
            </section>

            {dialog && (
                <JobFormDialog
                    key={`${dialog.mode}-${dialog.id ?? ""}`}
                    target={dialog}
                    onClose={closeDialog}
                    onSaved={() => {
                        closeDialog();
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
