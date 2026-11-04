"use client";

import Image from "next/image";

import checkboxChecked from "@/assets/Apply/icons/checkbox-checked-16.svg";
import ChoiceField from "@/components/ExperienceEducation/ChoiceField";

// Questions answered on the review stage itself, plus the declaration
// (Figma 1878:22199 and 1878:22233). Stored under the "review-and-submit"
// stage like any other stage's answers.

const heardFromOptions = ["LinkedIn", "Company Website", "Job board", "Employee Referral", "Campus", "Other"];

// The declaration's statements, in Figma's order; `required` ones must be
// ticked to submit.
const DECLARATIONS = [
    {
        field: "confirmAccurate",
        required: true,
        text: [
            "I confirm that the information I have provided is accurate and complete to the best of my knowledge.",
            "I understand that incorrect or misleading information may affect my application or any offer made to me.",
        ],
    },
    {
        field: "consentData",
        required: true,
        text: [
            "I consent to Ascendus Company collecting and processing my personal data, including my resume, identity details and uploaded documents, to assess my application.",
            "I have read the Privacy Policy.",
        ],
    },
    {
        field: "consentVerification",
        required: true,
        text: [
            "I understand that my education, employment history and identity details may be verified by Ascendus or an authorised third party,",
            "and I agree to provide the documents needed for this.",
        ],
    },
    {
        field: "consentSharing",
        required: true,
        text: [
            "I understand that my data may be shared with Ascendus group companies and service providers in other countries, only for official internal purposes.",
        ],
    },
    {
        field: "ownWork",
        required: true,
        text: [
            "I confirm that any portfolio or work samples I have shared are my own, and that I have permission to share them without breaching client confidentiality.",
        ],
    },
    {
        field: "noGuarantee",
        required: true,
        text: ["I understand that submitting this application does not guarantee an interview or an offer."],
    },
    {
        field: "contactConsent",
        required: true,
        text: [
            "I agree that Ascendus may contact me about my application by phone, SMS, WhatsApp or email, using the mobile number and email address I have provided.",
        ],
    },
    {
        field: "keepProfile",
        text: [
            "Keep my profile for other suitable roles at Ascendus, and notify me when new roles matching my profile are posted.",
        ],
    },
];

export const emptyReviewExtras = {
    heardFrom: "",
    ...Object.fromEntries(DECLARATIONS.map(({ field }) => [field, false])),
};

// Returns { field: message } for every invalid field; empty when valid.
export function validateReviewExtras(values) {
    const errors = {};
    if (!values.heardFrom) errors.heardFrom = "Select an option.";
    for (const { field, required } of DECLARATIONS) {
        if (required && !values[field]) errors[field] = "Please confirm this to submit.";
    }
    return errors;
}

// Figma 1878:22199: a white card with the chip question.
export function HeardFrom({ values, errors, onChange }) {
    return (
        <section className="w-full rounded-xl bg-white p-6">
            <ChoiceField
                field="heardFrom"
                label="How did you hear about us?"
                options={heardFromOptions}
                value={values.heardFrom}
                error={errors.heardFrom}
                onChange={(next) => onChange({ ...values, heardFrom: next }, "heardFrom")}
            />
        </section>
    );
}

// Figma 1878:22236: 16px box (grey with a dark border; red when missing),
// the blue checkbox when ticked.
function DeclarationCheckbox({ id, checked, onChange, invalid, describedBy, children }) {
    return (
        <label htmlFor={id} className="flex cursor-pointer items-start gap-2 text-sm leading-[1.4] text-neutral-700">
            <input
                suppressHydrationWarning
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                className="peer sr-only"
            />
            <span className="mt-[2px] grid size-4 shrink-0 place-items-center rounded peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action">
                {checked ? (
                    <Image src={checkboxChecked} alt="" width={16} height={16} />
                ) : (
                    <span className={`size-4 rounded border bg-[#f8f9fa] ${invalid ? "border-required" : "border-border-strong"}`} />
                )}
            </span>
            <span>{children}</span>
        </label>
    );
}

// Figma 1878:22233: a white card titled "Declaration", the statements 24
// apart; required ones end in a red asterisk.
export function Declaration({ values, errors, onChange }) {
    return (
        <section aria-labelledby="declaration-title" className="flex w-full flex-col gap-6 rounded-xl bg-white p-6">
            <h2 id="declaration-title" className="text-base leading-[1.2] font-medium text-ink">
                Declaration
            </h2>
            {DECLARATIONS.map(({ field, required, text }) => (
                <div key={field} className="flex flex-col gap-1">
                    <DeclarationCheckbox
                        id={field}
                        checked={Boolean(values[field])}
                        onChange={(checked) => onChange({ ...values, [field]: checked }, field)}
                        invalid={Boolean(errors[field])}
                        describedBy={errors[field] ? `${field}-message` : undefined}
                    >
                        {text.map((line, index) => (
                            <span key={index} className="block">
                                {line}
                                {required && index === text.length - 1 && <span className="text-[#d64545]"> *</span>}
                            </span>
                        ))}
                    </DeclarationCheckbox>
                    {errors[field] && (
                        <p id={`${field}-message`} className="pl-6 text-sm leading-[1.4] text-required">
                            {errors[field]}
                        </p>
                    )}
                </div>
            ))}
        </section>
    );
}
