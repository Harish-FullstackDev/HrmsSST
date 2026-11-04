"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import ApplyResult from "@/components/Apply/ApplyResult";
import { useApplication } from "@/components/Apply/ApplicationContext";
import useStageForm from "@/components/Apply/useStageForm";
import ApplyStage from "@/components/Apply/ApplyStage";
import ApplyStepFooter from "@/components/Apply/ApplyStepFooter";
import { applyStepHref, applySteps } from "@/components/Apply/applySteps";
import { isStageComplete } from "@/components/Apply/stageCompletion";
import { useApplyJob } from "@/components/Apply/ApplyShell";
import { uploadApplicationFiles } from "@/components/Apply/uploadApplicationFiles";
import { recordProfile } from "@/components/Jobs/candidateStorage";
import { phoneCodeFor } from "@/components/PersonalDetails/PersonalDetailsForm";
import ApplicationReview from "@/components/ReviewSubmit/ApplicationReview";
import Recaptcha from "@/components/ReviewSubmit/Recaptcha";
import { Declaration, HeardFrom, emptyReviewExtras, validateReviewExtras } from "@/components/ReviewSubmit/ReviewExtras";
import { submitApplication } from "@/lib/applications/actions";

// Figma frame 1878:21894: stage 6 of 6. Shows every answer for a last check,
// then asks how they heard about us and the declaration. Submit checks those
// first, then re-checks all stages and lists any that are incomplete.
// Submit uploads the files and saves the application to the database.
const ReviewSubmitPage = () => {
    const job = useApplyJob();
    const { resume, resumeUrl, stepData, setStepData, submitted, reference: referenceId, sentTo, completeApplication } =
        useApplication();
    const [incomplete, setIncomplete] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [captchaError, setCaptchaError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const captchaRef = useRef(null);
    const { values, errors, handleChange, handleBack, validateNow } = useStageForm({
        slug: "review-and-submit",
        initial: emptyReviewExtras,
        validate: validateReviewExtras,
        nextIndex: 5,
    });

    const handleSubmit = async () => {
        if (submitting) return;
        const valid = validateNow();
        if (!captchaToken) setCaptchaError("Please tick \"I'm not a robot\" to submit.");
        if (!valid || !captchaToken) return;
        setStepData("review-and-submit", values);

        const missing = applySteps.slice(0, 5).filter((_, index) => !isStageComplete(index, { resume, stepData }));
        setIncomplete(missing);
        if (missing.length > 0) return;

        setSubmitting(true);
        setSubmitError("");
        const answers = { ...stepData, "review-and-submit": values };
        const personal = answers["personal-details"] ?? {};
        const phone = personal.phone ? `${phoneCodeFor(personal.phoneCode).code} ${personal.phone}` : "";

        let result;
        try {
            // Files go straight to Storage, then the action saves the
            // application (and checks the reCAPTCHA token on the server).
            const files = await uploadApplicationFiles({ resume, documents: answers["upload-documents"] });
            result = await submitApplication({ jobSlug: job.slug, captchaToken, stepData: answers, phone, ...files });
        } catch (error) {
            result = { ok: false, error: error.message || "Your application couldn't be submitted. Please try again." };
        }

        if (!result.ok) {
            // A token is good for one check only, so the candidate ticks the
            // box again before retrying.
            captchaRef.current?.reset();
            setCaptchaToken(null);
            if (result.captcha) setCaptchaError(result.error);
            else setSubmitError(result.error);
            setSubmitting(false);
            return;
        }

        // My Profile still shows contact details from this browser.
        const roles = answers["experience-and-education"]?.workHistory ?? [];
        const latestRole = roles.find((role) => role.current === "Yes") ?? roles.at(-1);
        recordProfile({
            phone,
            location: [personal.city, personal.state, personal.country].filter(Boolean).join(", "),
            jobTitle: latestRole?.jobTitle ?? "",
            employer: latestRole?.organization ?? "",
        });
        completeApplication(result.reference, result.sentTo);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // The confirmation; the shell hides the stepper once submitted.
    if (submitted) {
        return (
            <ApplyResult
                title="Application was submitted successfully"
                message={
                    sentTo ? (
                        <>
                            We have sent a confirmation to <span className="font-medium break-all text-ink">{sentTo}</span>.
                        </>
                    ) : (
                        "We have sent a confirmation to your email."
                    )
                }
                reference={referenceId}
                href="/my-profile"
                linkLabel="Go to My Application"
            />
        );
    }

    return (
        <ApplyStage className="flex flex-col gap-8">
            <h2 className="text-base leading-[1.2] font-medium text-ink">Check Your Details, then Submit Your Application.</h2>
            <ApplicationReview resume={resume} resumeUrl={resumeUrl} data={stepData} />
            <HeardFrom values={values} errors={errors} onChange={handleChange} />

            <div className="flex flex-col gap-8">
                <Declaration values={values} errors={errors} onChange={handleChange} />

                <Recaptcha
                    ref={captchaRef}
                    invalid={Boolean(captchaError)}
                    error={captchaError}
                    onChange={(token) => {
                        setCaptchaToken(token);
                        if (token) setCaptchaError("");
                    }}
                />

                {submitError && (
                    <p role="alert" className="rounded-lg border border-required bg-[#fdf2f2] px-4 py-3 text-sm leading-5 text-required">
                        {submitError}
                    </p>
                )}

                {incomplete.length > 0 && (
                    <div role="alert" className="rounded-lg border border-required bg-[#fdf2f2] px-4 py-3 text-sm leading-5 text-required">
                        <p>Please complete these steps before submitting:</p>
                        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            {incomplete.map(({ slug, label }) => (
                                <li key={slug}>
                                    <Link href={applyStepHref(applySteps.findIndex((step) => step.slug === slug))} className="underline">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <ApplyStepFooter
                    backHref={applyStepHref(4)}
                    onBack={handleBack}
                    onNext={handleSubmit}
                    nextLabel={submitting ? "Submitting…" : "Submit"}
                    busy={submitting}
                   
                />
            </div>
        </ApplyStage>
    );
};

export default ReviewSubmitPage;
