"use client";

import ApplyStage from "@/components/Apply/ApplyStage";
import ApplyStepFooter from "@/components/Apply/ApplyStepFooter";
import { applyStepHref } from "@/components/Apply/applySteps";
import useStageForm from "@/components/Apply/useStageForm";
import UploadDocumentsForm, {
    emptyUploadDocuments,
    validateUploadDocuments,
} from "@/components/UploadDocuments/UploadDocumentsForm";

// Figma frame 1919:5166: stage 5 of 6. Next checks every required document
// is attached and moves to the review stage; Back keeps the entries and
// returns to stage 4.
const UploadDocumentsPage = () => {
    const { values, errors, handleChange, handleBack, handleNext, setFieldError } = useStageForm({
        slug: "upload-documents",
        initial: emptyUploadDocuments,
        validate: validateUploadDocuments,
        nextIndex: 5,
    });

    return (
        <ApplyStage className="flex flex-col gap-8">
            <UploadDocumentsForm values={values} errors={errors} onChange={handleChange} onError={setFieldError} />
            <ApplyStepFooter backHref={applyStepHref(3)} onBack={handleBack} onNext={handleNext} />
        </ApplyStage>
    );
};

export default UploadDocumentsPage;
