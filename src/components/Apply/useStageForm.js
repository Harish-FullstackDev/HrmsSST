"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useApplication, useStageControl } from "@/components/Apply/ApplicationContext";
import { applyStepHref } from "@/components/Apply/applySteps";

// Form state of one apply stage: starts from what the candidate already
// entered for this stage (kept in the apply context) or from `initial`,
// clears a field's error once it is edited, keeps the entries on Back, and on
// Next validates, focuses the first invalid field, saves and moves to
// `nextIndex`. The stepper uses the same save/validate when a stage is
// clicked. Error keys are element ids unless `fieldIds` maps them (ids
// must be unique across stages, since Next keeps the previous stage in the DOM).
export default function useStageForm({ slug, initial, validate, nextIndex, fieldIds = {} }) {
    const router = useRouter();
    const { stepData, setStepData } = useApplication();
    const [values, setValues] = useState(() => stepData[slug] ?? initial);
    const [errors, setErrors] = useState({});

    const handleChange = (next, field) => {
        setValues(next);
        if (errors[field]) setErrors(({ [field]: _, ...rest }) => rest);
    };

    const handleBack = () => setStepData(slug, values);

    // Shows the stage's errors and focuses the first; true when valid.
    const validateNow = () => {
        const found = validate(values);
        setErrors(found);
        const first = Object.keys(found)[0];
        if (first) document.getElementById(fieldIds[first] ?? first)?.focus();
        return !first;
    };

    const handleNext = () => {
        if (!validateNow()) return;
        setStepData(slug, values);
        router.push(applyStepHref(nextIndex));
    };

    // Lets the stepper keep (going back) or check (going forward) this stage.
    useStageControl({ save: handleBack, validateNow });

    // Shows a message on one field (e.g. a refused file).
    const setFieldError = (field, message) => setErrors((current) => ({ ...current, [field]: message }));

    return {
        values,
        setValues,
        errors,
        setFieldError,
        handleChange,
        handleBack,
        handleNext,
        validateNow,
        hadSavedValues: Boolean(stepData[slug]),
    };
}
