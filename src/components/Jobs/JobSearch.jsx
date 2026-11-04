"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import iconSearch from "@/assets/Jobs/icons/search-16.svg";
import iconChevron from "@/assets/Jobs/icons/chevron-down-18.svg";
import iconReset from "@/assets/Jobs/icons/reset-24.svg";
import JobListingCard from "./JobListingCard";
import { JOB_FILTERS } from "./jobFilters";

const EMPTY_FILTERS = Object.fromEntries(JOB_FILTERS.map((filter) => [filter.key, ""]));

// A job field can be a single value or a list (categories), and admin-entered
// values may differ in case from the placeholder options.
function jobMatches(job, field, selected) {
    const values = [].concat(job[field] ?? []);
    return values.some((value) => value?.toLowerCase() === selected.toLowerCase());
}

// A native select sizes itself to its longest option, so each dropdown gets
// its Figma width and a long selected value truncates.
function FilterSelect({ label, value, options, onChange, width }) {
    return (
        <label className="relative inline-flex shrink-0">
            <span className="sr-only">{label}</span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`h-[34px] cursor-pointer appearance-none truncate ${width} rounded-md border border-border-default bg-white py-[7px] pr-[43px] pl-[13px] text-sm leading-[1.4] text-[#374151] outline-none focus:border-action`}
            >
                <option value="">{label}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <Image
                src={iconChevron}
                alt=""
                className="pointer-events-none absolute top-1/2 right-[13px] size-[18px] -translate-y-1/2"
            />
        </label>
    );
}

// Figma 1487:8463: the heading, search controls and a single column of
// full-width job rows, 28 apart. `jobs` is every open job, loaded on the
// server; search and filters run here.
export default function JobSearch({ jobs }) {
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const filteredJobs = useMemo(() => {
        const query = search.trim().toLowerCase();
        return jobs.filter((job) => {
            const matchesSearch =
                !query ||
                [job.title, job.location, ...job.categories].some((field) => field?.toLowerCase().includes(query));
            const matchesFilters = JOB_FILTERS.every(
                (filter) => !filters[filter.key] || jobMatches(job, filter.field, filters[filter.key]),
            );
            return matchesSearch && matchesFilters;
        });
    }, [jobs, search, filters]);

    const hasActiveFilters = search !== "" || Object.values(filters).some(Boolean);

    const reset = () => {
        setSearch("");
        setFilters(EMPTY_FILTERS);
    };

    return (
        <section className="w-full px-4 py-10 sm:px-16 sm:py-16">
            <div className="flex w-full flex-col gap-4">
                <h1 className="text-2xl leading-[1.2] font-medium text-action capitalize">Find Your Next Opportunity</h1>

                <div className="flex flex-col gap-3 py-4">
                    <label className="relative block">
                        <span className="sr-only">Search jobs</span>
                        <Image
                            src={iconSearch}
                            alt=""
                            className="pointer-events-none absolute top-1/2 left-[14px] size-4 -translate-y-1/2"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by job title, keyword or location"
                            className="w-full rounded-lg border border-border-default bg-white pt-[11px] pr-[17px] pb-3 pl-[41px] text-sm leading-[1.4] text-[#111827] outline-none placeholder:text-border-strong focus:border-action"
                        />
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                        {JOB_FILTERS.map((filter) => (
                            <FilterSelect
                                key={filter.key}
                                label={filter.label}
                                width={filter.width}
                                value={filters[filter.key]}
                                options={filter.options}
                                onChange={(value) => setFilters((prev) => ({ ...prev, [filter.key]: value }))}
                            />
                        ))}

                        <button
                            type="button"
                            onClick={reset}
                            disabled={!hasActiveFilters}
                            className="ml-auto flex cursor-pointer items-center gap-1 px-2 py-[6px] text-base leading-[1.5] text-[#6b7280] capitalize transition-opacity hover:opacity-70 disabled:cursor-default disabled:opacity-50"
                        >
                            <Image src={iconReset} alt="" className="size-6" />
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-7">
                {filteredJobs.length === 0 ? (
                    <p className="py-10 text-center text-base leading-[1.5] text-ink-secondary">
                        {jobs.length === 0
                            ? "There are no open positions right now."
                            : "No roles match your search. Try clearing a filter."}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-7">
                        {filteredJobs.map((job) => (
                            <li key={job.slug}>
                                <JobListingCard job={job} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
