"use client";

import ApplyStage from "@/components/Apply/ApplyStage";
import ApplyStepFooter from "@/components/Apply/ApplyStepFooter";
import { applyStepHref } from "@/components/Apply/applySteps";
import useStageForm from "@/components/Apply/useStageForm";
import ExperienceEducationForm, {
    emptyExperienceEducation,
    validateExperienceEducation,
} from "@/components/ExperienceEducation/ExperienceEducationForm";

// Figma frame 1878:20839: stage 3 of 6. Next validates and moves to stage 4;
// Back keeps the entries and returns to stage 2.
const ExperienceEducationPage = () => {
    const { values, errors, handleChange, handleBack, handleNext } = useStageForm({
        slug: "experience-and-education",
        initial: emptyExperienceEducation,
        validate: validateExperienceEducation,
        nextIndex: 3,
        // No role saved yet means the role form is open; focus its first field.
        fieldIds: { workHistory: "role-jobTitle" },
    });

    return (
        <ApplyStage className="flex flex-col gap-8">
            <ExperienceEducationForm values={values} errors={errors} onChange={handleChange} />
            <ApplyStepFooter backHref={applyStepHref(1)} onBack={handleBack} onNext={handleNext} />
        </ApplyStage>
    );
};

export default ExperienceEducationPage;
