"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import resumeIcon from "@/assets/HrApplicants/icons/resume-16x20.svg";
import {
    ALL,
    ALL_TIME,
    ANY_DATE,
    HrDateMenu,
    HrFilterMenu,
    HrListFooter,
    HrPeriodMenu,
    HrScrollTable,
    HrSearchField,
    HrSortMenu,
    HrStatus,
    hrCell,
    hrHeadCell,
    hrRowLine,
    paginate,
    useTopSearch,
    withinDates,
} from "@/components/HrCommon/HrListControls";
import HrConfirmDialog from "@/components/HrCommon/HrConfirmDialog";
import HrMenu from "@/components/HrCommon/HrMenu";
import { updateApplicationStatus, updateApplicationsStatus } from "@/lib/applications/actions";
import ApplicantPanel from "./ApplicantPanel";
import { APPLICANT_STATUSES, CONFIRM_STATUS, EMPLOYMENT_TYPES, SETTABLE_STATUSES, formatAppliedOn } from "./applicantsData";

const PAGE_SIZE = 5;

const statusFor = Object.fromEntries(APPLICANT_STATUSES.map((status) => [status.value, status]));

const SORTS = {
    newest: { label: "Newest first", compare: (a, b) => b.appliedOn.localeCompare(a.appliedOn) },
    oldest: { label: "Oldest first", compare: (a, b) => a.appliedOn.localeCompare(b.appliedOn) },
    "name-asc": { label: "Name A–Z", compare: (a, b) => a.name.localeCompare(b.name) },
    "name-desc": { label: "Name Z–A", compare: (a, b) => b.name.localeCompare(a.name) },
};

const COLUMNS = [
    { label: "Name", width: "w-[calc(19%-48px)]" },
    { label: "Role", width: "w-[17.25%]" },
    { label: "Date", width: "w-[12.75%]" },
    { label: "Type", width: "w-[15.5%]" },
    { label: "Resume", width: "w-[20.5%]" },
    { label: "Status", width: "w-[15%]" },
];

const checkboxClass = "size-4 cursor-pointer accent-action";

// A checkbox that can show "some selected" (the header's select-page box).
function SelectBox({ checked, indeterminate = false, ...props }) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current) ref.current.indeterminate = indeterminate;
    }, [indeterminate]);
    return <input ref={ref} type="checkbox" checked={checked} className={checkboxClass} {...props} />;
}

// "Priya Menon" for one applicant, "3 applicants" for more.
const describeApplicants = (applicants) => (applicants.length === 1 ? applicants[0].name : `${applicants.length} applicants`);

// Figma 2060:2170: the applicants list. A search and period bar, then a grey
// card with the title and filters over a white table. Opening an applicant
// (their name or View Resume) shows them in the side panel. On desktop the
// page fits the screen; the table scrolls inside the card if it has to.
// `initialApplicants` come from listApplicationsForHr.
export default function Applicants({ initialApplicants }) {
    const router = useRouter();
    // Status changes made here, shown straight away while the server saves
    // them: { applicationId: status }.
    const [statusChanges, setStatusChanges] = useState({});
    const [statusError, setStatusError] = useState("");
    const [query, setQuery] = useState("");
    const topSearch = useTopSearch();
    const [status, setStatusFilter] = useState(ALL);
    const [sort, setSort] = useState("newest");
    const [role, setRole] = useState(ALL);
    const [type, setType] = useState(ALL);
    const [dateRange, setDateRange] = useState(ANY_DATE);
    const [period, setPeriod] = useState(ALL_TIME);
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);
    // Ticked rows for the bulk action, and the status waiting for HR to
    // confirm it on them.
    const [checkedIds, setCheckedIds] = useState(() => new Set());
    const [bulkStatus, setBulkStatus] = useState(null);
    const [notice, setNotice] = useState("");

    // Next keeps this page mounted but hidden (React Activity) after navigating
    // away, so an open side panel would stay in the DOM and the HR shell would
    // keep making room for it on the next page. Close it as the page hides;
    // a layout effect so it's gone before the next page paints.
    useLayoutEffect(() => () => setSelectedId(null), []);

    // Any change to what's listed goes back to page 1.
    const refilter = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const rows = initialApplicants.map((applicant) =>
        statusChanges[applicant.id] ? { ...applicant, status: statusChanges[applicant.id] } : applicant,
    );
    const roles = [...new Set(rows.map((applicant) => applicant.role))].sort();
    const matches = (needle) => (applicant) =>
        !needle || [applicant.name, applicant.email, applicant.role].some((text) => text.toLowerCase().includes(needle));
    const listed = rows
        .filter(
            (applicant) =>
                matches(query.trim().toLowerCase())(applicant) &&
                matches(topSearch)(applicant) &&
                (status === ALL || applicant.status === status) &&
                (role === ALL || applicant.role === role) &&
                (type === ALL || applicant.type === type) &&
                withinDates(applicant.appliedOn, dateRange, period),
        )
        .sort(SORTS[sort].compare);
    const paged = paginate(listed, page, PAGE_SIZE);
    const selected = rows.find((applicant) => applicant.id === selectedId);

    // Only ticked rows still listed count (a filter can hide some).
    const checked = listed.filter((applicant) => checkedIds.has(applicant.id));
    const pageIds = paged.pageRows.map((applicant) => applicant.id);
    const pageChecked = pageIds.filter((id) => checkedIds.has(id)).length;
    const toggleChecked = (id) =>
        setCheckedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    const togglePage = () =>
        setCheckedIds((current) => {
            const next = new Set(current);
            const all = pageIds.every((id) => next.has(id));
            for (const id of pageIds) {
                if (all) next.delete(id);
                else next.add(id);
            }
            return next;
        });

    const applyBulk = async () => {
        const ids = checked.map((applicant) => applicant.id);
        const result = await updateApplicationsStatus(ids, bulkStatus);
        if (!result.ok) return { error: result.error };
        const skipped = ids.length - result.updated.length;
        setStatusChanges((current) => ({ ...current, ...Object.fromEntries(result.updated.map((id) => [id, bulkStatus])) }));
        setStatusError("");
        setNotice(
            `${result.updated.length} moved to ${statusFor[bulkStatus].label}.` +
                (skipped ? ` ${skipped} left unchanged (withdrawn or no longer available).` : ""),
        );
        setCheckedIds(new Set());
        setBulkStatus(null);
        router.refresh();
        return null;
    };
    const withdrawnChecked = checked.filter((applicant) => applicant.status === "withdrawn").length;

    const setStatus = async (id, status) => {
        const previous = rows.find((applicant) => applicant.id === id)?.status;
        setStatusError("");
        setNotice("");
        setStatusChanges((current) => ({ ...current, [id]: status }));
        const result = await updateApplicationStatus(id, status);
        if (!result.ok) {
            setStatusChanges((current) => ({ ...current, [id]: previous }));
            setStatusError(result.error);
            return;
        }
        router.refresh();
    };

    return (
        <div className="flex flex-col gap-8 px-4 pt-8 pb-8 sm:px-8 lg:h-[calc(100dvh-83px)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <HrSearchField label="Search applicants" value={query} onChange={refilter(setQuery)} />
                <HrPeriodMenu value={period} onChange={refilter(setPeriod)} />
            </div>

            {statusError && (
                <p role="alert" className="rounded-lg border border-required bg-[#fdf2f2] px-4 py-3 text-sm leading-5 text-required">
                    {statusError}
                </p>
            )}
            {notice && !statusError && (
                <p role="status" className="flex items-center justify-between gap-4 rounded-lg border border-success-500 bg-[#f1f8f3] px-4 py-3 text-sm leading-5 text-ink">
                    {notice}
                    <button type="button" onClick={() => setNotice("")} className="text-xs text-muted-ink underline hover:text-ink">
                        Dismiss
                    </button>
                </p>
            )}

            <section
                aria-labelledby="applicants-title"
                className="flex flex-col gap-8 rounded-[18px] border border-neutral-100 bg-[#f8f8f8] px-4 pt-5 pb-[18px] sm:px-[30px] lg:min-h-0 lg:flex-1"
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 id="applicants-title" className="text-xl leading-[1.2] font-medium text-[#16161a]">
                        Applicants List <span className="font-normal text-muted-ink">({listed.length.toLocaleString("en-US")})</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <HrSortMenu sorts={SORTS} value={sort} onChange={refilter(setSort)} />
                        <HrFilterMenu
                            label="Filter by status"
                            placeholder="Status"
                            options={[{ value: ALL, label: "All statuses" }, ...APPLICANT_STATUSES]}
                            value={status}
                            onChange={refilter(setStatusFilter)}
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

                {/* The bulk action bar, while any rows are ticked. Every bulk
                    move asks to confirm first. */}
                {checked.length > 0 && (
                    <div
                        role="region"
                        aria-label="Bulk actions"
                        className="-mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-primary-200 bg-surface-brand-subtle px-4 py-2.5 text-sm leading-[1.4] text-ink motion-safe:animate-[apply-fade-in_200ms_ease-out_backwards]"
                    >
                        <span className="font-medium">{checked.length} selected</span>
                        <HrMenu
                            label="Change stage of selected applicants"
                            align="start"
                            items={SETTABLE_STATUSES.map((option) => ({
                                label: option.label,
                                onSelect: () => setBulkStatus(option.value),
                            }))}
                            className="flex h-8 items-center gap-2 rounded-lg bg-action px-4 text-xs leading-[1.4] text-white transition-colors hover:bg-primary"
                        >
                            Change Stage
                        </HrMenu>
                        <button
                            type="button"
                            onClick={() => setCheckedIds(new Set())}
                            className="text-xs text-muted-ink underline hover:text-ink"
                        >
                            Clear selection
                        </button>
                    </div>
                )}

                {/* Figma 2060:2170: the table and pagination on white, the
                    header row grey with its top corners rounded. */}
                <div className="flex flex-col rounded-t-lg bg-white pb-[17px] lg:min-h-0 lg:flex-1">
                    <HrScrollTable
                        widths={["w-12", ...COLUMNS.map(({ width }) => width)]}
                        minWidth={970}
                        head={[
                            <th key="select" scope="col" className="h-[52px] pl-[18px]">
                                <SelectBox
                                    aria-label="Select all applicants on this page"
                                    checked={pageIds.length > 0 && pageChecked === pageIds.length}
                                    indeterminate={pageChecked > 0 && pageChecked < pageIds.length}
                                    disabled={pageIds.length === 0}
                                    onChange={togglePage}
                                />
                            </th>,
                            ...COLUMNS.map(({ label }) => (
                                <th key={label} scope="col" className={hrHeadCell}>
                                    {label}
                                </th>
                            )),
                        ]}
                        empty={
                            paged.pageRows.length === 0 && (
                                <p className="px-6 py-10 text-center text-sm leading-[1.4] text-muted-ink">No applicants match these filters.</p>
                            )
                        }
                    >
                        {paged.pageRows.map((applicant) => {
                            const open = applicant.id === selectedId;
                            const status = statusFor[applicant.status];
                            return (
                                <tr
                                    key={applicant.id}
                                    className={`h-[86px] ${hrRowLine} ${checkedIds.has(applicant.id) ? "bg-surface-brand-subtle/60" : ""}`}
                                >
                                    <td className="pl-[18px]">
                                        <SelectBox
                                            aria-label={`Select ${applicant.name}`}
                                            checked={checkedIds.has(applicant.id)}
                                            onChange={() => toggleChecked(applicant.id)}
                                        />
                                    </td>
                                    <td className={hrCell}>
                                        <div className="flex flex-col gap-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedId(applicant.id)}
                                                className="truncate text-left hover:text-action hover:underline"
                                            >
                                                {applicant.name}
                                            </button>
                                            <a
                                                href={`mailto:${applicant.email}`}
                                                className="truncate text-[#555555] hover:text-action hover:underline"
                                            >
                                                {applicant.email}
                                            </a>
                                        </div>
                                    </td>
                                    <td className={hrCell}>{applicant.role}</td>
                                    <td className={hrCell}>{formatAppliedOn(applicant.appliedOn)}</td>
                                    <td className={hrCell}>{applicant.type}</td>
                                    <td className={hrCell}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedId(applicant.id)}
                                            aria-label={`View resume of ${applicant.name}`}
                                            className={`flex h-[34px] w-[147px] items-center justify-center gap-2.5 rounded-lg bg-primary-100 px-3 text-xs leading-[1.4] transition-colors hover:bg-primary-200 ${
                                                open ? "text-ink" : "text-[#555555]"
                                            }`}
                                        >
                                            <Image src={resumeIcon} alt="" width={16} height={20} />
                                            View Resume
                                        </button>
                                    </td>
                                    <td className={hrCell}>
                                        <HrStatus swatch={status.swatch}>{status.label}</HrStatus>
                                    </td>
                                </tr>
                            );
                        })}
                    </HrScrollTable>
                    <HrListFooter
                        paged={paged}
                        total={listed.length}
                        onPageChange={setPage}
                        className="border-t border-neutral-100 px-[18px] pt-4"
                    />
                </div>
            </section>

            {selected && (
                <ApplicantPanel
                    key={selected.id}
                    applicant={selected}
                    onClose={() => setSelectedId(null)}
                    onStatusChange={setStatus}
                />
            )}

            {bulkStatus && (
                <HrConfirmDialog
                    title={
                        CONFIRM_STATUS[bulkStatus]?.title(checked.length) ??
                        `Move ${checked.length === 1 ? "1 applicant" : `${checked.length} applicants`} to ${statusFor[bulkStatus].label}?`
                    }
                    message={
                        <>
                            <p>
                                {CONFIRM_STATUS[bulkStatus]?.text(describeApplicants(checked)) ??
                                    `${describeApplicants(checked)} will move to ${statusFor[bulkStatus].label}.`}
                            </p>
                            {withdrawnChecked > 0 && (
                                <p className="mt-2 text-xs text-muted-ink">
                                    {withdrawnChecked} withdrawn {withdrawnChecked === 1 ? "application stays" : "applications stay"} as{" "}
                                    {withdrawnChecked === 1 ? "it is" : "they are"}.
                                </p>
                            )}
                        </>
                    }
                    confirmLabel={CONFIRM_STATUS[bulkStatus]?.confirmLabel ?? `Move to ${statusFor[bulkStatus].label}`}
                    tone={CONFIRM_STATUS[bulkStatus]?.tone ?? "default"}
                    onCancel={() => setBulkStatus(null)}
                    onConfirm={applyBulk}
                />
            )}
        </div>
    );
}
