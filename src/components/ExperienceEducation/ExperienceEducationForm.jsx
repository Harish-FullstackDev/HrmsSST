"use client";

import { useLayoutEffect, useRef, useState } from "react";

import chevronYear from "@/assets/Apply/icons/chevron-down-light-24.svg";
import { ApplyField, ApplySelect, ApplyTextInput, messageIdFor } from "@/components/Apply/ApplyFormControls";
import ChoiceField from "@/components/ExperienceEducation/ChoiceField";
import WorkHistory, { roleDates } from "@/components/ExperienceEducation/WorkHistory";
import {
    OTHER_OPTION,
    degreesFor,
    experienceLevels,
    fieldsOfStudy,
    graduationYears,
    noticePeriods,
    qualifications,
    shortenOptions,
    yesNo,
} from "@/components/ExperienceEducation/experienceOptions";
import { capitalizeFirst } from "@/lib/jobs/jobForm";

// Any level other than Fresher asks for work history, notice period and
// compensation (Figma 1878:19784, 1878:21065, 1878:20488, 1878:20133).
export const isExperienced = (level) => Boolean(level) && level !== "Fresher";

// The fresher's extra chip questions after Total Relevant Experience and
// Willing to Relocate (Figma 1878:20839).
const LEVEL_QUESTIONS = {
    Fresher: [
        {
            field: "largestProject",
            label: "Largest Project You have Worked On",
            options: ["Course Assignment", "Mini Project", "Final-year Project", "Internship Project", "Real Client Project"],
        },
        {
            field: "realWorldWork",
            label: "Real World Work",
            options: ["Internships", "Freelance or Volunteer Works", "Part-time Jobs", "Not Yet"],
            multiple: true,
            exclusive: "Not Yet",
        },
    ],
};

export const questionsFor = (level) => LEVEL_QUESTIONS[level] ?? [];

export const emptyExperienceEducation = {
    qualification: "",
    degree: "",
    fieldOfStudy: "",
    university: "",
    graduationYear: "",
    relevantExperience: "",
    relocate: "",
    largestProject: "",
    realWorldWork: [],
    // Experienced candidates: [{ jobTitle, organization, location, current,
    // startMonth, startYear, endMonth, endYear }].
    workHistory: [],
    servingNotice: "",
    noticePeriod: "",
    canShorten: "",
    // Lakhs per annum, as typed (e.g. "12.5").
    currentSalary: "",
    expectedSalary: "",
};

// Labels of the experienced candidates' fields, shared with the review stage.
export const experiencedLabels = {
    workHistory: "Experiences",
    servingNotice: "Currently Serving Notice Period?",
    noticePeriod: "Notice Period",
    canShorten: "Can Your Notice Period be Shortened?",
    currentSalary: "Current / Last Drawn Annual Salary",
    expectedSalary: "Expected Annual Salary",
};

// The highest expected annual salary accepted, in LPA. Not shown on the form.
export const MAX_EXPECTED_LPA = 24;

export const formatLpa =(value) => (value ? `${value} LPA` : "");

// Labels of the fixed fields, shared with the review stage.
export const experienceLabels = {
    qualification: "Qualification",
    degree: "Degree",
    fieldOfStudy: "Field of Study",
    university: "University or College",
    graduationYear: "Year of Graduation",
    relevantExperience: "Total Relevant Experience",
    relocate: "Willing to Relocate?",
};

const REQUIRED = {
    qualification: "Select your qualification.",
    degree: "Enter your degree.",
    fieldOfStudy: "Enter your field of study.",
    university: "Enter your university or college.",
    graduationYear: "Select your year of graduation.",
    relevantExperience: "Select your relevant experience.",
    relocate: "Select an option.",
};

const isEmpty = (value) => (Array.isArray(value) ? value.length === 0 : !String(value ?? "").trim());

// The notice questions apply only to someone in a job now: one of their saved
// roles has Current Employment "Yes". Otherwise they are hidden, not asked,
// and left off the review (any earlier answers stay saved but unused).
export const hasCurrentRole = (values) => (values.workHistory ?? []).some((role) => role.current === "Yes");

// Returns { field: message } for every invalid field; the level's questions
// count only for the chosen level.
export function validateExperienceEducation(values) {
    const errors = {};
    for (const [field, message] of Object.entries(REQUIRED)) {
        if (isEmpty(values[field])) errors[field] = message;
    }
    for (const { field, multiple } of questionsFor(values.relevantExperience)) {
        if (isEmpty(values[field])) errors[field] = multiple ? "Select at least one option." : "Select an option.";
    }
    if (isExperienced(values.relevantExperience)) {
        if (isEmpty(values.workHistory)) errors.workHistory = "Add at least one role.";
        if (hasCurrentRole(values) && isEmpty(values.servingNotice)) errors.servingNotice = "Select an option.";
        if (hasCurrentRole(values) && values.servingNotice === "Yes") {
            if (isEmpty(values.noticePeriod)) errors.noticePeriod = "Select your notice period.";
            if (isEmpty(values.canShorten)) errors.canShorten = "Select an option.";
        }
        if (isEmpty(values.expectedSalary)) errors.expectedSalary = "Enter your expected annual salary.";
        // Catches answers saved before the limit; worded without the number.
        else if (Number(values.expectedSalary) > MAX_EXPECTED_LPA) errors.expectedSalary = "Enter a lower expected salary.";
    }
    return errors;
}

// Shorter labels and order of the fixed fields on the review (Figma 1947:14050).
const REVIEW_LABELS = {
    qualification: "Qualification",
    university: "University",
    degree: "Degree",
    fieldOfStudy: "Field",
    graduationYear: "Graduation Year",
    relevantExperience: "Total Relevant Experience",
    relocate: "Willing to Relocate",
};

// [{ field, label, value }] of every field the chosen level asks, for the
// review stage. The work history comes last.
export function experienceSummary(values) {
    const rows = [
        ...Object.keys(REVIEW_LABELS).map((field) => ({ field, label: REVIEW_LABELS[field], value: values[field] })),
        ...questionsFor(values.relevantExperience).map(({ field, label }) => ({ field, label, value: values[field] })),
    ];
    if (!isExperienced(values.relevantExperience)) return rows;

    const shown = hasCurrentRole(values)
        ? ["servingNotice", "noticePeriod", "currentSalary", "expectedSalary", "workHistory"]
        : ["currentSalary", "expectedSalary", "workHistory"];
    if (hasCurrentRole(values) && values.servingNotice === "Yes") shown.splice(2, 0, "canShorten");
    // As on the form: the notice period is optional unless serving notice.
    const labels = {
        ...experiencedLabels,
        noticePeriod: values.servingNotice === "Yes" ? "Notice Period" : "If Notice Period Applicable",
    };
    const display = {
        workHistory: (values.workHistory ?? []).map(
            (role) => `${role.jobTitle} | ${role.organization} | ${role.location} | ${roleDates(role)}`,
        ),
        currentSalary: formatLpa(values.currentSalary),
        expectedSalary: formatLpa(values.expectedSalary),
    };
    return [
        ...rows,
        ...shown.map((field) => ({ field, label: labels[field], value: display[field] ?? values[field] })),
    ];
}

// Opens and closes smoothly: the height eases between 0 and the content's
// (grid rows 0fr / 1fr) while the content fades and slides down into place,
// and the parent grid's 24 gap above it is taken back while closed. Closed
// content stays mounted but inert. The content is clipped while moving and
// unclipped once open, so dropdown lists inside can spill out. Open uses
// translate-none, not translate-y-0: any translate value makes a stacking
// context, which would trap those lists under the fields that follow.
function Reveal({ open, className = "", children }) {
    const [settled, setSettled] = useState(open);
    if (!open && settled) setSettled(false);

    return (
        <div
            inert={!open}
            onTransitionEnd={(event) => {
                if (event.target === event.currentTarget && event.propertyName === "grid-template-rows" && open) setSettled(true);
            }}
            className={`grid transition-[grid-template-rows,opacity,translate,margin] duration-500 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none ${
                open ? "grid-rows-[1fr] translate-none opacity-100" : "-mt-6 grid-rows-[0fr] -translate-y-2 opacity-0"
            } ${className}`}
        >
            <div className={`min-h-0 ${settled ? "overflow-visible" : `overflow-hidden ${open ? "motion-reduce:overflow-visible" : ""}`}`}>
                {children}
            </div>
        </div>
    );
}

// A dropdown whose last option, "Other", opens a field to type a value that
// isn't listed (degree, field of study). `value` is the answer itself (a
// listed one or the typed one); a saved value that isn't listed reopens as
// "Other".
function SelectOrOtherField({ field, options, placeholder, otherPlaceholder, value, error, onChange }) {
    const listed = Boolean(value) && options.includes(value) && value !== OTHER_OPTION;
    const [other, setOther] = useState(Boolean(value) && !listed);
    const describedBy = messageIdFor(field, { error });

    return (
        <ApplyField id={field} label={experienceLabels[field]} required error={error}>
            <div className="flex flex-col gap-2">
                <ApplySelect
                    id={field}
                    name={field}
                    value={other ? OTHER_OPTION : listed ? value : ""}
                    onChange={(event) => {
                        const picked = event.target.value;
                        setOther(picked === OTHER_OPTION);
                        onChange(picked === OTHER_OPTION ? "" : picked);
                    }}
                    options={options}
                    placeholder={placeholder}
                    invalid={Boolean(error) && !other}
                    describedBy={describedBy}
                />
                {other && (
                    <ApplyTextInput
                        id={`${field}Other`}
                        name={`${field}Other`}
                        aria-label={experienceLabels[field]}
                        autoFocus
                        maxLength={100}
                        value={value}
                        onChange={(event) => onChange(capitalizeFirst(event.target.value))}
                        placeholder={otherPlaceholder}
                        invalid={Boolean(error)}
                        describedBy={describedBy}
                    />
                )}
            </div>
        </ApplyField>
    );
}

function SectionHeading({ id, children }) {
    return (
        <h2 id={id} className="text-base leading-[1.2] font-medium text-[#0b1c30]">
            {children}
        </h2>
    );
}

// Figma 1878:20839 (Fresher) and 1878:19784 etc. (experienced): stage 3 of
// the application. An Education card (qualification chips over two columns,
// then degree, field of study, university and year in four columns) and an
// Experience card whose questions after the first row depend on the level:
// a fresher gets the project / real-world-work chips; anyone else gets their
// work history, notice period questions and compensation.
export default function ExperienceEducationForm({ values, errors, onChange }) {
    const setValue = (field, value) => {
        const next = { ...values, [field]: value };
        // A listed degree of another qualification no longer fits; a typed one stays.
        if (field === "qualification" && degreesFor(null).includes(values.degree) && !degreesFor(value).includes(values.degree)) {
            next.degree = "";
        }
        onChange(next, field);
    };

    const control = (field) => ({
        id: field,
        name: field,
        value: values[field] ?? "",
        invalid: Boolean(errors[field]),
        describedBy: messageIdFor(field, { error: errors[field] }),
    });
    const text = (field, placeholder) => (
        <ApplyField id={field} label={experienceLabels[field]} required error={errors[field]}>
            <ApplyTextInput {...control(field)} onChange={(event) => setValue(field, event.target.value)} placeholder={placeholder} />
        </ApplyField>
    );
    const choice = (field, options, className) => (
        <ChoiceField
            field={field}
            label={experienceLabels[field]}
            options={options}
            value={values[field]}
            error={errors[field]}
            onChange={(next) => setValue(field, next)}
            className={className}
        />
    );

    const experienced = isExperienced(values.relevantExperience);
    const currentlyEmployed = hasCurrentRole(values);
    const salary = (field, required) => (
        <div
            ref={(node) => {
                salaryNodes.current[field] = node;
            }}
        >
            <ApplyField id={field} label={experiencedLabels[field]} required={required} error={errors[field]}>
                <ApplyTextInput
                    {...control(field)}
                    inputMode="decimal"
                    placeholder="Enter CTC in LPA"
                    // Lakhs per annum: up to two digits (99 LPA) with up to two
                    // decimals. The expected salary also stops at
                    // MAX_EXPECTED_LPA, silently (the limit isn't shown).
                    onChange={(event) => {
                        const next = event.target.value.replace(/[^\d.]/g, "");
                        if (!/^\d{0,2}(\.\d{0,2})?$/.test(next)) return;
                        if (field === "expectedSalary" && Number(next) > MAX_EXPECTED_LPA) return;
                        setValue(field, next);
                    }}
                />
            </ApplyField>
        </div>
    );

    // The shortening question shows only while serving notice, which shifts
    // the salary fields a column. They slide over from where they were: their
    // spots are noted before the answer changes, then each animates from its
    // old spot to the new one (FLIP).
    const salaryNodes = useRef({});
    const salaryStarts = useRef(null);
    const setServingNotice = (next) => {
        salaryStarts.current = Object.fromEntries(
            Object.entries(salaryNodes.current)
                .filter(([, node]) => node)
                .map(([field, node]) => [field, { x: node.offsetLeft, y: node.offsetTop }]),
        );
        setValue("servingNotice", next);
    };
    useLayoutEffect(() => {
        const starts = salaryStarts.current;
        salaryStarts.current = null;
        if (!starts || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        for (const [field, node] of Object.entries(salaryNodes.current)) {
            const from = starts[field];
            if (!node || !from) continue;
            const dx = from.x - node.offsetLeft;
            const dy = from.y - node.offsetTop;
            if (dx || dy) {
                node.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
                    duration: 350,
                    easing: "cubic-bezier(0.2, 0, 0, 1)",
                });
            }
        }
    }, [values.servingNotice]);

    return (
        <div className="flex w-full flex-col gap-8">
            <section aria-labelledby="education-title" className="flex flex-col gap-8">
                <SectionHeading id="education-title">Education</SectionHeading>
                <div className="grid w-full gap-x-8 gap-y-6 rounded-xl bg-white p-6 md:grid-cols-2 lg:grid-cols-4">
                    {choice("qualification", qualifications, "md:col-span-2")}
                    <div className="hidden lg:col-span-2 lg:block" />
                    <SelectOrOtherField
                        // A new qualification starts the degree picker afresh.
                        key={values.qualification || "none"}
                        field="degree"
                        options={degreesFor(values.qualification)}
                        placeholder="Select your degree"
                        otherPlaceholder="Type your degree"
                        value={values.degree ?? ""}
                        error={errors.degree}
                        onChange={(next) => setValue("degree", next)}
                    />
                    <SelectOrOtherField
                        field="fieldOfStudy"
                        options={fieldsOfStudy}
                        placeholder="Select your field of study"
                        otherPlaceholder="Type your field of study"
                        value={values.fieldOfStudy ?? ""}
                        error={errors.fieldOfStudy}
                        onChange={(next) => setValue("fieldOfStudy", next)}
                    />
                    {text("university", "Ex: Anna University")}
                    <ApplyField id="graduationYear" label={experienceLabels.graduationYear} required error={errors.graduationYear}>
                        <ApplySelect
                            {...control("graduationYear")}
                            onChange={(event) => setValue("graduationYear", event.target.value)}
                            options={graduationYears}
                            placeholder="Select the Year of Graduation"
                            icon={chevronYear}
                        />
                    </ApplyField>
                </div>
            </section>

            <section aria-labelledby="experience-title" className="flex flex-col gap-8">
                <SectionHeading id="experience-title">Experience</SectionHeading>
                <div className="grid w-full gap-x-8 gap-y-6 rounded-xl bg-white p-6 lg:grid-cols-3">
                    {choice("relevantExperience", experienceLevels, "lg:col-span-2")}
                    {choice("relocate", yesNo)}
                    {/* The fresher's questions and the experienced block both
                        stay mounted and open or close with the level. */}
                    <Reveal open={values.relevantExperience === "Fresher"} className="lg:col-span-2">
                        <div className="flex flex-col gap-6">
                            {questionsFor("Fresher").map(({ field, label, options, multiple, exclusive }) => (
                                <ChoiceField
                                    key={field}
                                    field={field}
                                    label={label}
                                    options={options}
                                    multiple={multiple}
                                    exclusive={exclusive}
                                    value={values[field]}
                                    error={errors[field]}
                                    onChange={(next) => setValue(field, next)}
                                />
                            ))}
                        </div>
                    </Reveal>

                    <Reveal open={experienced} className="lg:col-span-3">
                        <div className="flex flex-col gap-8">
                            <WorkHistory
                                value={values.workHistory}
                                error={errors.workHistory}
                                onChange={(next) => setValue("workHistory", next)}
                            />
                            {/* Relative: the salary slide measures against this grid. */}
                            <div className="relative grid gap-x-8 gap-y-6 lg:grid-cols-3">
                                {/* Only for someone employed now (hasCurrentRole). */}
                                {currentlyEmployed && (
                                    <>
                                        <ChoiceField
                                            field="servingNotice"
                                            label={experiencedLabels.servingNotice}
                                            options={yesNo}
                                            value={values.servingNotice}
                                            error={errors.servingNotice}
                                            onChange={setServingNotice}
                                            className="motion-safe:animate-[apply-fade-in_200ms_ease-out_backwards]"
                                        />
                                        <ChoiceField
                                            field="noticePeriod"
                                            // Optional unless they are serving notice now.
                                            label={values.servingNotice === "Yes" ? "Notice Period" : "If Notice Period Applicable"}
                                            required={values.servingNotice === "Yes"}
                                            options={noticePeriods}
                                            value={values.noticePeriod}
                                            error={errors.noticePeriod}
                                            onChange={(next) => setValue("noticePeriod", next)}
                                            className="motion-safe:animate-[apply-fade-in_200ms_ease-out_backwards] lg:col-span-2"
                                        />
                                    </>
                                )}
                                {currentlyEmployed && values.servingNotice === "Yes" && (
                                    <ChoiceField
                                        field="canShorten"
                                        label={experiencedLabels.canShorten}
                                        options={shortenOptions}
                                        value={values.canShorten}
                                        error={errors.canShorten}
                                        onChange={(next) => setValue("canShorten", next)}
                                        className="motion-safe:animate-[apply-check-in_200ms_ease-out_backwards]"
                                    />
                                )}
                                {/* Start on the left, or beside the shortening question when it shows. */}
                                {salary("currentSalary", false)}
                                {salary("expectedSalary", true)}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
