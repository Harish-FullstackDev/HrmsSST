import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { capitalizeFirst, emptyJob, jobRow, jobValues, validateJob } from "../src/lib/jobs/jobForm.js";

const TODAY = "2026-11-03";

// A job that can be published.
const complete = (overrides = {}) => ({
    ...emptyJob,
    title: "UI Designer",
    department: "Design",
    employmentType: "Full-time",
    workMode: "Hybrid",
    openings: 2,
    summary: "Design clear, accessible screens for our HR products.",
    location: "Chennai",
    responsibilities: ["Own the design system", "Run usability tests"],
    qualifications: ["Portfolio of shipped work"],
    closingDate: "2026-12-01",
    experienceLevel: "Experienced",
    minYears: "3",
    skills: ["Figma", "Prototyping"],
    ...overrides,
});

const publishErrors = (values) => validateJob(values, { publish: true, today: TODAY });
const draftErrors = (values) => validateJob(values, { publish: false, today: TODAY });

describe("validateJob: publishing", () => {
    test("a complete job has no errors", () => {
        assert.deepEqual(publishErrors(complete()), {});
    });

    test("an empty form reports every required field", () => {
        const errors = publishErrors(emptyJob);
        for (const field of ["title", "department", "summary", "location", "responsibilities", "qualifications", "closingDate", "skills"]) {
            assert.ok(errors[field], `expected an error for ${field}`);
        }
    });

    test("title: 2 to 120 characters with a letter", () => {
        assert.ok(publishErrors(complete({ title: "A" })).title);
        assert.ok(publishErrors(complete({ title: "   " })).title);
        assert.ok(publishErrors(complete({ title: "1234" })).title);
        assert.ok(publishErrors(complete({ title: "x".repeat(121) })).title);
        assert.equal(publishErrors(complete({ title: "x".repeat(120) })).title, undefined);
        assert.equal(publishErrors(complete({ title: "  QA  " })).title, undefined);
    });

    test("options outside the lists are refused", () => {
        assert.ok(publishErrors(complete({ department: "Space" })).department);
        assert.ok(publishErrors(complete({ employmentType: "Freelance" })).employmentType);
        assert.ok(publishErrors(complete({ workMode: "Moon" })).workMode);
        assert.ok(publishErrors(complete({ experienceLevel: "Guru" })).experienceLevel);
    });

    test("openings: whole number 1 to 999", () => {
        for (const bad of [0, -1, 1.5, 1000, "", "abc", null]) {
            assert.ok(publishErrors(complete({ openings: bad })).openings, `openings ${bad}`);
        }
        for (const good of [1, 999, "5"]) assert.equal(publishErrors(complete({ openings: good })).openings, undefined);
    });

    test("summary: 20 to 3000 characters after trimming", () => {
        assert.ok(publishErrors(complete({ summary: `   ${"a".repeat(19)}   ` })).summary);
        assert.ok(publishErrors(complete({ summary: "a".repeat(3001) })).summary);
        assert.equal(publishErrors(complete({ summary: "a".repeat(3000) })).summary, undefined);
    });

    test("closing date: real, not past, within a year", () => {
        assert.ok(publishErrors(complete({ closingDate: "2026-02-30" })).closingDate, "not a real date");
        assert.ok(publishErrors(complete({ closingDate: "03/12/2026" })).closingDate, "wrong format");
        assert.ok(publishErrors(complete({ closingDate: "2026-11-02" })).closingDate, "yesterday");
        assert.equal(publishErrors(complete({ closingDate: TODAY })).closingDate, undefined, "today is allowed");
        assert.equal(publishErrors(complete({ closingDate: "2027-11-03" })).closingDate, undefined, "365 days ahead");
        assert.ok(publishErrors(complete({ closingDate: "2027-11-04" })).closingDate, "366 days ahead");
    });

    test("lists: at least one, 3 to 300 characters, at most 20, no repeats", () => {
        assert.ok(publishErrors(complete({ responsibilities: ["", "  "] })).responsibilities);
        assert.ok(publishErrors(complete({ responsibilities: ["ab"] })).responsibilities);
        assert.ok(publishErrors(complete({ responsibilities: ["x".repeat(301)] })).responsibilities);
        assert.ok(publishErrors(complete({ qualifications: ["Same item", "same ITEM"] })).qualifications);
        const many = Array.from({ length: 21 }, (_, i) => `Item number ${i}`);
        assert.ok(publishErrors(complete({ qualifications: many })).qualifications);
        assert.equal(publishErrors(complete({ qualifications: many.slice(0, 20) })).qualifications, undefined);
        // Blank rows (the form's empty last row) are ignored.
        assert.equal(publishErrors(complete({ responsibilities: ["Real duty", ""] })).responsibilities, undefined);
    });

    test("minimum years only for Experienced, 1 to 50", () => {
        assert.equal(publishErrors(complete({ experienceLevel: "Fresher", minYears: "" })).minYears, undefined);
        for (const bad of ["", "0", "51", "2.5", "abc"]) {
            assert.ok(publishErrors(complete({ minYears: bad })).minYears, `minYears ${bad}`);
        }
        assert.equal(publishErrors(complete({ minYears: "50" })).minYears, undefined);
    });

    test("skills: 1 to 5, each up to 50 characters", () => {
        assert.ok(publishErrors(complete({ skills: [] })).skills);
        assert.ok(publishErrors(complete({ skills: ["a", "b", "c", "d", "e", "f"] })).skills);
        assert.ok(publishErrors(complete({ skills: ["x".repeat(51)] })).skills);
    });

    test("location needs a letter", () => {
        assert.ok(publishErrors(complete({ location: "123" })).location);
        assert.ok(publishErrors(complete({ location: "" })).location);
    });
});

describe("validateJob: drafts", () => {
    test("only a title is required", () => {
        assert.deepEqual(draftErrors({ ...emptyJob, title: "UI Designer" }), {});
        assert.ok(draftErrors(emptyJob).title);
    });

    test("a past closing date is fine on a draft, a fake one is not", () => {
        assert.equal(draftErrors(complete({ closingDate: "2020-01-01" })).closingDate, undefined);
        assert.ok(draftErrors(complete({ closingDate: "2026-13-01" })).closingDate);
    });

    // The database checks min_experience_years 0..50; a draft that broke it
    // used to fail with only "couldn't be saved".
    test("what is filled in must still be valid", () => {
        assert.ok(draftErrors(complete({ minYears: "60" })).minYears);
        assert.ok(draftErrors(complete({ minYears: "-3" })).minYears);
        assert.equal(draftErrors(complete({ minYears: "" })).minYears, undefined);
        assert.ok(draftErrors(complete({ openings: 0 })).openings);
        assert.ok(draftErrors(complete({ summary: "a".repeat(3001) })).summary);
        assert.equal(draftErrors(complete({ summary: "short" })).summary, undefined);
        assert.ok(draftErrors(complete({ location: "999" })).location);
        assert.ok(draftErrors(complete({ responsibilities: ["x".repeat(301)] })).responsibilities);
        assert.ok(draftErrors(complete({ skills: ["a", "b", "c", "d", "e", "f"] })).skills);
    });

    test("hostile shapes don't throw", () => {
        const weird = { title: { toString: () => "Hacker" }, openings: {}, responsibilities: "not a list", skills: null, closingDate: 20261201 };
        assert.doesNotThrow(() => draftErrors(weird));
        assert.doesNotThrow(() => publishErrors(weird));
        assert.doesNotThrow(() => jobRow(weird));
    });
});

describe("capitalizeFirst", () => {
    test("capitalises only the first letter", () => {
        assert.equal(capitalizeFirst("pondy (Hybrid)"), "Pondy (Hybrid)");
        assert.equal(capitalizeFirst("ui designer"), "Ui designer");
        assert.equal(capitalizeFirst("  chennai"), "  Chennai");
        assert.equal(capitalizeFirst("éclair"), "Éclair");
    });

    test("leaves text that doesn't start with a lower-case letter", () => {
        assert.equal(capitalizeFirst("iOS developer".replace("i", "I")), "IOS developer");
        assert.equal(capitalizeFirst("(remote) pondy"), "(remote) pondy");
        assert.equal(capitalizeFirst("3D artist"), "3D artist");
        assert.equal(capitalizeFirst(""), "");
        assert.equal(capitalizeFirst(null), "");
    });

    test("saving capitalises the free-text fields", () => {
        const row = jobRow(
            complete({
                title: "ui designer",
                location: "pondy (Hybrid)",
                summary: "design clear, accessible screens for our HR products.",
                responsibilities: ["own the design system"],
                qualifications: ["portfolio of shipped work"],
            }),
        );
        assert.equal(row.title, "Ui designer");
        assert.equal(row.location, "Pondy (Hybrid)");
        assert.equal(row.about_job, "Design clear, accessible screens for our HR products.");
        assert.deepEqual(row.responsibilities, ["Own the design system"]);
        assert.deepEqual(row.qualifications, ["Portfolio of shipped work"]);
    });
});

describe("jobRow / jobValues", () => {
    test("a complete job maps to a row", () => {
        assert.deepEqual(jobRow(complete({ responsibilities: [" Own the design system ", ""] })), {
            title: "UI Designer",
            department: "Design",
            type_of_work: "Full-time",
            mode_of_work: "Hybrid",
            vacancies: 2,
            about_job: "Design clear, accessible screens for our HR products.",
            location: "Chennai",
            responsibilities: ["Own the design system"],
            qualifications: ["Portfolio of shipped work"],
            closes_on: "2026-12-01",
            experience_level: "Experienced",
            min_experience_years: 3,
            skills: ["Figma", "Prototyping"],
        });
    });

    test("openings are read the same way validateJob reads them", () => {
        assert.equal(jobRow(complete({ openings: "1e2" })).vacancies, 100);
        assert.equal(jobRow(complete({ openings: "abc" })).vacancies, 1);
        assert.equal(jobRow(complete({ openings: 5000 })).vacancies, 999);
    });

    test("Fresher jobs store no minimum years", () => {
        assert.equal(jobRow(complete({ experienceLevel: "Fresher", minYears: "4" })).min_experience_years, null);
    });

    test("unknown options are not stored", () => {
        const row = jobRow(complete({ department: "<script>", workMode: "x" }));
        assert.equal(row.department, "");
        assert.equal(row.mode_of_work, "");
    });

    test("a row round-trips back to the same form values", () => {
        const values = complete();
        assert.deepEqual(validateJob(jobValues(jobRow(values)), { publish: true, today: TODAY }), {});
        assert.deepEqual(jobValues(jobRow(values)), { ...values, minYears: "3" });
    });
});
