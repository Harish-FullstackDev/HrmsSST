"use client";

import { useState } from "react";
import Image from "next/image";

import chevronLight from "@/assets/Apply/icons/chevron-down-light-16.svg";
import closeIcon from "@/assets/Apply/icons/close-16.svg";
import radioOff from "@/assets/Apply/icons/radio-off-22.svg";
import radioOn from "@/assets/Apply/icons/radio-on-22.svg";
import {
    ApplyField,
    ApplyPhoneInput,
    ApplySelect,
    ApplyTextInput,
    messageIdFor,
} from "@/components/Apply/ApplyFormControls";
import {
    DEFAULT_PHONE_CODE,
    OTHER_OPTION,
    countries,
    countryStates,
    fluencyLevels,
    genders,
    languages as languageOptions,
    phoneCodes,
} from "@/components/PersonalDetails/personalDetailsOptions";
import { capitalizeFirst } from "@/lib/jobs/jobForm";

export const emptyPersonalDetails = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneCode: DEFAULT_PHONE_CODE,
    phone: "",
    altPhoneCode: DEFAULT_PHONE_CODE,
    altPhone: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    pan: "",
    linkedIn: "",
    // [{ language, fluency }]
    languages: [],
};

// Legal names: letters (any script), spaces, hyphens, apostrophes and dots.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian PAN: five letters, four digits, one letter.
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// The picked phone code's entry; India when none was picked.
export const phoneCodeFor = (code) =>
    phoneCodes.find((entry) => entry.code === code) ?? phoneCodes.find((entry) => entry.code === DEFAULT_PHONE_CODE);

// Returns { field: message } for every invalid field; empty when valid.
// Answers saved before a field existed lack it, so every read falls back.
export function validatePersonalDetails(values) {
    const errors = {};
    const valueOf = (field) => String(values[field] ?? "").trim();
    const requireValue = (field, message) => {
        if (!valueOf(field)) errors[field] = message;
    };

    requireValue("firstName", "Enter your first name.");
    requireValue("lastName", "Enter your last name.");
    requireValue("email", "Enter your email address.");
    requireValue("phone", "Enter your mobile number.");
    requireValue("gender", "Select an option.");
    requireValue("country", "Select your country.");
    requireValue("state", "Select your state.");
    requireValue("city", "Enter your city.");
    requireValue("pan", "Enter your PAN number.");

    for (const field of ["firstName", "middleName", "lastName"]) {
        if (!errors[field] && valueOf(field) && !NAME_PATTERN.test(valueOf(field))) {
            errors[field] = "Use letters only, without special characters.";
        }
    }
    if (!errors.email && !EMAIL_PATTERN.test(valueOf("email"))) errors.email = "Enter a valid email address.";
    if (!errors.pan && !PAN_PATTERN.test(valueOf("pan"))) errors.pan = "Enter a valid PAN, e.g. ABCDE1234F.";
    if (valueOf("linkedIn") && !/linkedin\.com\/?/i.test(valueOf("linkedIn"))) {
        errors.linkedIn = "Enter a LinkedIn profile URL.";
    }
    for (const [field, codeField] of [
        ["phone", "phoneCode"],
        ["altPhone", "altPhoneCode"],
    ]) {
        const { digits: lengths } = phoneCodeFor(values[codeField]);
        const digits = valueOf(field).replace(/\D/g, "");
        if (!errors[field] && digits && !lengths.includes(digits.length)) {
            errors[field] = `Enter a ${lengths.join(" or ")}-digit mobile number.`;
        }
    }
    if (!(values.languages?.length > 0)) errors.languages = "Add at least one language.";

    return errors;
}

// Gender as Figma's 22px radios, 24 apart.
function GenderRadios({ value, error, onChange }) {
    return (
        <div
            role="radiogroup"
            aria-label="Gender"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={messageIdFor("gender", { error })}
            className="flex min-h-[42px] flex-wrap items-center gap-x-6 gap-y-1"
        >
            {genders.map((gender, index) => (
                <label key={gender} className="flex cursor-pointer items-center gap-2 text-sm leading-[1.4] text-ink">
                    <input
                        // The first radio takes the field id so the label and error focus reach it.
                        id={index === 0 ? "gender" : undefined}
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={value === gender}
                        onChange={() => onChange(gender)}
                        className="peer sr-only"
                    />
                    <Image
                        src={value === gender ? radioOn : radioOff}
                        alt=""
                        width={22}
                        height={22}
                        className="rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action"
                    />
                    {gender}
                </label>
            ))}
        </div>
    );
}

// Figma 1878:19740: Language and Fluency pickers with Add Language, then the
// added languages as removable chips ("English | Native"). "Other" opens a
// field to type a language that isn't listed.
function LanguagePicker({ value, error, onChange }) {
    const [language, setLanguage] = useState("");
    const [otherName, setOtherName] = useState("");
    const [fluency, setFluency] = useState("");
    const [pickError, setPickError] = useState(null);
    const available = [
        ...languageOptions.filter((option) => !value.some((entry) => entry.language === option)),
        OTHER_OPTION,
    ];
    const isOther = language === OTHER_OPTION;

    const add = () => {
        const name = isOther ? capitalizeFirst(otherName.trim()) : language;
        if (!name || !fluency) {
            setPickError(isOther && !name ? "Type the language name." : "Choose a language and its fluency.");
            return;
        }
        if (isOther && !/^[\p{L}\p{M}][\p{L}\p{M} .'-]{0,39}$/u.test(name)) {
            setPickError("Use letters only for the language name.");
            return;
        }
        if (value.some((entry) => entry.language.toLowerCase() === name.toLowerCase())) {
            setPickError(`${name} is already added.`);
            return;
        }
        onChange([...value, { language: name, fluency }]);
        setLanguage("");
        setOtherName("");
        setFluency("");
        setPickError(null);
    };

    const message = pickError || error;

    return (
        <section aria-labelledby="languages-label" className="flex flex-col gap-8 rounded-xl bg-white p-6">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:gap-8">
                    <div className="flex items-center gap-3 md:w-[400px]">
                        <span id="languages-label" className="text-base leading-[1.2] font-medium whitespace-nowrap text-[#374151]">
                            Language <span className="text-[#ef4444]">*</span>
                        </span>
                        <div className="min-w-0 flex-1">
                            <ApplySelect
                                id="languages"
                                name="language"
                                aria-label="Language"
                                value={language}
                                onChange={(event) => setLanguage(event.target.value)}
                                options={available}
                                placeholder="Search for a language"
                                icon={chevronLight}
                                invalid={Boolean(message) && !language}
                                describedBy={message ? "languages-message" : undefined}
                            />
                        </div>
                    </div>
                    {isOther && (
                        <div className="md:w-[240px] motion-safe:animate-[apply-check-in_200ms_ease-out_backwards]">
                            <ApplyTextInput
                                id="otherLanguage"
                                name="otherLanguage"
                                aria-label="Language name"
                                autoFocus
                                maxLength={40}
                                value={otherName}
                                onChange={(event) => setOtherName(capitalizeFirst(event.target.value))}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        add();
                                    }
                                }}
                                placeholder="Type the language"
                                invalid={Boolean(pickError) && !otherName.trim()}
                                describedBy={message ? "languages-message" : undefined}
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-3 md:w-[400px]">
                        <span className="text-base leading-[1.2] font-medium whitespace-nowrap text-[#374151]">
                            Fluency <span className="text-[#ef4444]">*</span>
                        </span>
                        <div className="min-w-0 flex-1">
                            <ApplySelect
                                id="fluency"
                                name="fluency"
                                aria-label="Fluency"
                                value={fluency}
                                onChange={(event) => setFluency(event.target.value)}
                                options={fluencyLevels}
                                placeholder="Select fluency"
                                icon={chevronLight}
                                invalid={Boolean(pickError) && !fluency}
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={add}
                        className="h-[42px] shrink-0 cursor-pointer self-start rounded-lg bg-action px-6 text-xs leading-[1.4] text-white transition-colors hover:bg-[#005192] md:self-auto"
                    >
                        Add Language
                    </button>
                </div>
                {message && (
                    <p id="languages-message" className="text-xs leading-[1.4] text-required">
                        {message}
                    </p>
                )}
            </div>

            {value.length > 0 && (
                <ul aria-label="Added languages" className="flex flex-wrap gap-4 md:gap-8">
                    {value.map((entry) => (
                        <li
                            key={entry.language}
                            className="flex items-center gap-2 rounded-xl bg-surface-brand-subtle p-3 text-sm leading-[1.4] text-ink motion-safe:animate-[apply-check-in_200ms_ease-out_backwards]"
                        >
                            <span>
                                {entry.language} <span className="text-ink-secondary">| {entry.fluency}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => onChange(value.filter((item) => item !== entry))}
                                aria-label={`Remove ${entry.language}`}
                                className="cursor-pointer"
                            >
                                <Image src={closeIcon} alt="" width={16} height={16} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

// Figma 1878:19628: stage 2 of the application. The required-fields note and
// the "Personal Details" heading, a white card with three equal columns (32
// apart; two on tablets, one on phones), then the languages card.
export default function PersonalDetailsForm({ values, errors, onChange }) {
    const setValue = (field, value) => {
        const next = { ...values, [field]: value };
        // A new country invalidates the chosen state.
        if (field === "country") next.state = "";
        onChange(next, field);
    };
    const set = (field) => (event) => setValue(field, event.target.value);

    // Shared props of a field's control.
    const control = (field, hint) => ({
        id: field,
        name: field,
        value: values[field] ?? "",
        onChange: set(field),
        invalid: Boolean(errors[field]),
        describedBy: messageIdFor(field, { hint, error: errors[field] }),
    });
    const text = (field, props, hint) => <ApplyTextInput {...control(field, hint)} {...props} />;
    // Mobile numbers take digits only: anything else typed or pasted is
    // dropped, and the number stops at the longest length for its code.
    const phone = (field, codeField) => (
        <ApplyPhoneInput
            {...control(field)}
            onChange={(event) => {
                const maxLength = Math.max(...phoneCodeFor(values[codeField]).digits);
                setValue(field, event.target.value.replace(/\D/g, "").slice(0, maxLength));
            }}
            countryCode={phoneCodeFor(values[codeField]).code}
            codes={phoneCodes}
            onCountryCodeChange={(code) => onChange({ ...values, [codeField]: code }, field)}
            autoComplete={field === "phone" ? "tel-national" : "off"}
            placeholder="9876543210"
        />
    );

    const NAME_HINT = "Enter Name as per Aadhaar and PAN";
    const EMAIL_HINT = "Your account email; it can't be changed here";
    const states = countryStates[values.country] ?? [];

    return (
        <div className="flex w-full flex-col gap-8">
            <section aria-labelledby="personal-details-title" className="flex w-full flex-col gap-3">
                <p className="text-xs leading-[1.4] text-[#44474d]">
                    The fields marked with an asterisk (<span className="text-[#ba1a1a]">*</span>) are required.
                </p>
                <h2 id="personal-details-title" className="text-base leading-[1.2] font-medium text-[#374151]">
                    Personal Details
                </h2>
                <div className="grid w-full gap-x-8 gap-y-4 rounded-xl bg-white p-6 md:grid-cols-2 lg:grid-cols-3">
                    <ApplyField id="firstName" label="First Name" required hint={NAME_HINT} error={errors.firstName}>
                        {text("firstName", { autoComplete: "given-name", placeholder: "Ex: Priya" }, NAME_HINT)}
                    </ApplyField>
                    <ApplyField id="middleName" label="Middle Name" error={errors.middleName}>
                        {text("middleName", { autoComplete: "additional-name" })}
                    </ApplyField>
                    <ApplyField id="lastName" label="Last Name" required error={errors.lastName}>
                        {text("lastName", { autoComplete: "family-name", placeholder: "Ex: Menon" })}
                    </ApplyField>

                    <ApplyField id="email" label="Email address" required hint={EMAIL_HINT} error={errors.email}>
                        {/* Locked to the signed-in account's address. */}
                        {text("email", { type: "email", autoComplete: "email", readOnly: true }, EMAIL_HINT)}
                    </ApplyField>
                    <ApplyField id="phone" label="Mobile Number" required error={errors.phone}>
                        {phone("phone", "phoneCode")}
                    </ApplyField>
                    <ApplyField id="altPhone" label="Alternate Mobile Number" error={errors.altPhone}>
                        {phone("altPhone", "altPhoneCode")}
                    </ApplyField>

                    <ApplyField id="gender" label="Gender" required error={errors.gender}>
                        <GenderRadios value={values.gender} error={errors.gender} onChange={(gender) => setValue("gender", gender)} />
                    </ApplyField>
                    <ApplyField id="country" label="Country" required error={errors.country}>
                        <ApplySelect {...control("country")} placeholder="Select Your Country" options={countries} />
                    </ApplyField>
                    <ApplyField id="state" label="State" required error={errors.state}>
                        <ApplySelect
                            {...control("state")}
                            placeholder={values.country ? "Select Your State" : "Select a country first"}
                            options={states}
                            disabled={!values.country}
                        />
                    </ApplyField>

                    <ApplyField id="city" label="City" required error={errors.city}>
                        {text("city", { autoComplete: "address-level2", placeholder: "Ex: Chennai" })}
                    </ApplyField>
                    <ApplyField id="pan" label="PAN No." required error={errors.pan}>
                        <ApplyTextInput
                            {...control("pan")}
                            onChange={(event) => setValue("pan", event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                            autoComplete="off"
                            placeholder="Enter Your PAN No."
                        />
                    </ApplyField>
                    <ApplyField id="linkedIn" label="LinkedIn Profile URL" error={errors.linkedIn}>
                        {text("linkedIn", { type: "url", autoComplete: "url", placeholder: "Ex: linkedin.com/in/yourname" })}
                    </ApplyField>
                </div>
            </section>

            <LanguagePicker
                value={values.languages ?? []}
                error={errors.languages}
                onChange={(next) => setValue("languages", next)}
            />
        </div>
    );
}
