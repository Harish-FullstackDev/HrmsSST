"use client";

import Image from "next/image";

import chevronSecondary from "@/assets/Apply/icons/chevron-down-secondary-16.svg";
import { ApplyTagPicker } from "@/components/Apply/ApplyCombobox";
import { useApplyJob } from "@/components/Apply/ApplyShell";
import { skills as skillOptions } from "@/components/ExperienceEducation/experienceOptions";
import Certifications from "@/components/SkillsCertifications/Certifications";

export const MAX_SKILLS = 6;

// Kinds of work link a candidate can add; each link row picks one.
export const LINK_TYPES = ["Portfolio", "GitHub", "Behance", "Dribbble", "Personal Website", "Other"];
export const MAX_LINKS = 5;
const emptyLink = () => ({ type: LINK_TYPES[0], url: "" });

export const emptySkillsCertifications = {
    skills: [],
    // [{ name, provider, month, year, fileName }]
    // TODO: send the certificate files once the backend takes them; only the
    // file name is kept for now.
    certifications: [],
    links: [emptyLink()],
};

// Answers saved before the redesign kept certifications as plain names, and
// some kept one `portfolio` string; read them in the current shape.
export const certificationsOf = (values) => (values.certifications ?? []).filter((item) => item && typeof item === "object");
export const workLinks = (values) =>
    values.links ?? (values.portfolio ? [{ type: LINK_TYPES[0], url: values.portfolio }] : [emptyLink()]);

const linkId = (index) => `workLink-${index}`;

const URL_PATTERN = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i;

// A link reduced to what identifies it, so "https://www.github.com/me/" and
// "github.com/me" count as the same: no scheme, no "www.", no trailing slash,
// case ignored.
const comparableLink = (url) =>
    url
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/+$/, "");

// Returns { field: message } for every invalid field; empty when valid.
// Each link can be given once only, under any type: a repeat is marked on the
// later row.
export function validateSkillsCertifications(values) {
    const errors = {};
    if (!(values.skills?.length > 0)) errors.skills = "Add at least one skill.";
    const seen = new Map();
    workLinks(values).forEach((link, index) => {
        const url = link.url.trim();
        if (!url) return;
        if (!URL_PATTERN.test(url)) {
            errors[linkId(index)] = "Enter a valid link.";
            return;
        }
        const key = comparableLink(url);
        if (seen.has(key)) {
            errors[linkId(index)] = `This link is already added as ${seen.get(key)}.`;
        } else {
            seen.set(key, link.type);
        }
    });
    return errors;
}

// Figma 1947:13141: work links, two per row 32 apart. Each is one grey field
// with the link type in a darker cell on the left (a native select laid
// invisibly over it, like the phone code) and the URL beside it, 24 apart;
// then Add (on the last link only, up to MAX_LINKS) and Delete (while there
// is more than one). Optional.
function WorkLinks({ links, errors, onChange }) {
    const update = (index, field, value) =>
        onChange(
            links.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
            index,
        );

    return (
        <section aria-labelledby="work-links-label" className="flex flex-col gap-6 rounded-xl bg-white p-6">
            <label id="work-links-label" htmlFor={linkId(0)} className="text-base leading-[1.2] font-medium text-[#374151]">
                Portfolio, GitHub or Other Work link
            </label>
            <ul className="flex flex-wrap gap-x-8 gap-y-4">
                {links.map((link, index) => {
                    const error = errors[linkId(index)];
                    const last = index === links.length - 1;
                    return (
                        <li
                            key={index}
                            className="flex w-full flex-col gap-1 motion-safe:animate-[apply-check-in_200ms_ease-out_backwards] lg:w-[calc(50%-16px)]"
                        >
                            <div className="flex items-center gap-6">
                                <div
                                    className={`flex h-[42px] min-w-0 flex-1 items-center gap-6 overflow-hidden rounded-lg border bg-[#f8f9fa] p-px transition-colors focus-within:border-action ${
                                        error ? "border-required" : "border-border-default"
                                    }`}
                                >
                                    <span className="relative flex h-full shrink-0 items-center gap-1 rounded-lg bg-[#e4e7eb] px-3 text-sm leading-[1.4] text-ink-secondary">
                                        {link.type}
                                        <Image src={chevronSecondary} alt="" width={16} height={16} />
                                        <select
                                            suppressHydrationWarning
                                            aria-label="Link type"
                                            value={link.type}
                                            onChange={(event) => update(index, "type", event.target.value)}
                                            className="absolute inset-0 cursor-pointer appearance-none opacity-0"
                                        >
                                            {LINK_TYPES.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </span>
                                    <input
                                        suppressHydrationWarning
                                        id={linkId(index)}
                                        name={linkId(index)}
                                        type="url"
                                        autoComplete="url"
                                        aria-label={`${link.type} link`}
                                        aria-invalid={Boolean(error) || undefined}
                                        aria-describedby={error ? `${linkId(index)}-message` : undefined}
                                        value={link.url}
                                        onChange={(event) => update(index, "url", event.target.value)}
                                        placeholder="Enter your link"
                                        className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm leading-5 text-ink outline-none placeholder:text-ink-disabled"
                                    />
                                </div>
                                {(last && links.length < MAX_LINKS) || links.length > 1 ? (
                                    <span className="flex shrink-0 items-center gap-2 text-sm leading-[1.4]">
                                        {last && links.length < MAX_LINKS && (
                                            <button
                                                type="button"
                                                onClick={() => onChange([...links, emptyLink()], links.length)}
                                                className="cursor-pointer px-3 py-2 text-muted-ink underline hover:text-ink"
                                            >
                                                Add<span className="sr-only"> another link</span>
                                            </button>
                                        )}
                                        {links.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => onChange(links.filter((_, i) => i !== index), index)}
                                                className="cursor-pointer px-3 py-2 text-[#b43838] underline hover:text-required"
                                            >
                                                Delete<span className="sr-only"> {link.type} link</span>
                                            </button>
                                        )}
                                    </span>
                                ) : null}
                            </div>
                            {error && (
                                <p id={`${linkId(index)}-message`} className="text-xs leading-[1.4] text-required">
                                    {error}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

// Figma 1878:21407: stage 4 of the application. A Skills card (Figma
// 1919:5044: the picker, 417 wide, with the picked skills beside it), the Certifications section,
// and the work links card.
export default function SkillsCertificationsForm({ values, errors, onChange }) {
    const setValue = (field, value) => onChange({ ...values, [field]: value }, field);
    // The job's own skills lead the suggestions, then the general list
    // (without repeats, case ignored).
    const jobSkills = (useApplyJob()?.skills ?? []).filter(Boolean);
    const taken = new Set(jobSkills.map((skill) => skill.toLowerCase()));
    const suggestions = [...jobSkills, ...skillOptions.filter((skill) => !taken.has(skill.toLowerCase()))];

    return (
        <div className="flex w-full flex-col gap-8">
            <section aria-labelledby="skills-label" className="flex flex-col gap-3 rounded-xl bg-white p-6">
                <label id="skills-label" htmlFor="skillsPicker" className="text-base leading-[1.2] font-medium text-[#374151]">
                    Skills <span className="text-[#ef4444]">*</span>
                </label>
                <ApplyTagPicker
                    id="skillsPicker"
                    value={values.skills ?? []}
                    onChange={(next) => setValue("skills", next)}
                    options={suggestions}
                    max={MAX_SKILLS}
                    placeholder="Search or add a skill"
                    fullPlaceholder="Maximum skills reached"
                    listLabel="Selected skills"
                    tagsBeside
                    muted
                    invalid={Boolean(errors.skills)}
                    describedBy={errors.skills ? "skillsPicker-message" : undefined}
                />
                {errors.skills && (
                    <p id="skillsPicker-message" className="text-xs leading-[1.4] text-required">
                        {errors.skills}
                    </p>
                )}
            </section>

            <Certifications value={certificationsOf(values)} onChange={(next) => setValue("certifications", next)} />

            <WorkLinks
                links={workLinks(values)}
                errors={errors}
                onChange={(next, index) => {
                    // Drop the old single-link answer once the list is edited.
                    const { portfolio: _, ...rest } = values;
                    onChange({ ...rest, links: next }, linkId(index));
                }}
            />
        </div>
    );
}
