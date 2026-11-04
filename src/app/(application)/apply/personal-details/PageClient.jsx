"use client";

import { useEffect } from "react";

import ApplyStage from "@/components/Apply/ApplyStage";
import ApplyStepFooter from "@/components/Apply/ApplyStepFooter";
import { applyStepHref } from "@/components/Apply/applySteps";
import useStageForm from "@/components/Apply/useStageForm";
import PersonalDetailsForm, {
    emptyPersonalDetails,
    validatePersonalDetails,
} from "@/components/PersonalDetails/PersonalDetailsForm";
import { createClient } from "@/lib/supabase/client";

// Figma frame 1878:19542: stage 2 of 6. Starts from what the candidate already
// entered, otherwise from the signed-in account's name and email. Next
// validates and moves to stage 3; Back returns to stage 1.
const PersonalDetailsPage = () => {
    const { values, setValues, errors, handleChange, handleBack, handleNext, hadSavedValues } = useStageForm({
        slug: "personal-details",
        initial: emptyPersonalDetails,
        validate: validatePersonalDetails,
        nextIndex: 2,
    });

    // Fill the name from the account, without overwriting anything typed. The
    // email is locked to the account's address, so it is always set.
    useEffect(() => {
        let cancelled = false;
        createClient()
            .auth.getUser()
            .then(({ data }) => {
                const user = data?.user;
                if (cancelled || !user) return;
                const meta = user.user_metadata ?? {};
                setValues((current) => ({
                    ...current,
                    firstName: hadSavedValues ? current.firstName : current.firstName || meta.first_name || "",
                    lastName: hadSavedValues ? current.lastName : current.lastName || meta.last_name || "",
                    email: user.email || current.email,
                }));
            });
        return () => {
            cancelled = true;
        };
        // Only on arrival.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ApplyStage className="flex flex-col gap-8">
            <PersonalDetailsForm values={values} errors={errors} onChange={handleChange} />
            <ApplyStepFooter backHref={applyStepHref(0)} onBack={handleBack} onNext={handleNext} />
        </ApplyStage>
    );
};

export default PersonalDetailsPage;
