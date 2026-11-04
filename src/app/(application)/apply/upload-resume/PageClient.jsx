"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useApplication, useStageControl } from "@/components/Apply/ApplicationContext";
import ApplyStage from "@/components/Apply/ApplyStage";
import ApplyStepFooter from "@/components/Apply/ApplyStepFooter";
import { applyStepHref } from "@/components/Apply/applySteps";
import UploadResume from "@/components/UploadResume/UploadResume";

// Figma frame 1878:19400: stage 1 of 6. Next needs a resume; Back returns to
// the job details.
const UploadResumePage = () => {
    const router = useRouter();
    const { resume } = useApplication();
    const [error, setError] = useState(null);

    // The resume is kept in the context as soon as it is picked, so there is
    // nothing extra to save; going forward needs one.
    const validateNow = () => {
        if (resume) return true;
        setError("Upload your resume to continue.");
        return false;
    };
    useStageControl({ save: () => {}, validateNow });

    const handleNext = () => {
        if (validateNow()) router.push(applyStepHref(1));
    };

    return (
        <ApplyStage className="flex flex-col gap-8">
            <UploadResume error={error} onError={setError} />
            <ApplyStepFooter backHref="/job-details" onNext={handleNext} />
        </ApplyStage>
    );
};

export default UploadResumePage;
