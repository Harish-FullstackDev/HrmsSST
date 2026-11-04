"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useApplication } from "@/components/Apply/ApplicationContext";
import ApplicationStepper from "@/components/Apply/ApplicationStepper";
import { applyStepHref } from "@/components/Apply/applySteps";
import { isStageComplete } from "@/components/Apply/stageCompletion";

// The stepper plus click-to-navigate, alongside the stages' Next/Back.
// - Any stage already opened can be clicked.
// - Going back keeps the open stage's entries (like Back).
// - Going forward first checks the open stage (like Next; its errors show and
//   nothing happens if it is invalid), then stops at the first stage in
//   between that is still incomplete instead of skipping past it.
export default function ApplyStepperNav({ currentIndex }) {
    const router = useRouter();
    const { resume, stepData, maxVisited, setMaxVisited, stageControlRef, submitted } = useApplication();

    useEffect(() => {
        if (currentIndex > maxVisited) setMaxVisited(currentIndex);
    }, [currentIndex, maxVisited, setMaxVisited]);

    const handleStepClick = (target) => {
        const control = stageControlRef.current;

        if (target < currentIndex) {
            control?.save();
            router.push(applyStepHref(target));
            return;
        }

        if (control && !control.validateNow()) return;
        control?.save();

        // The open stage was just checked; stages after it come from saved data.
        let destination = target;
        for (let index = currentIndex + 1; index < target; index += 1) {
            if (!isStageComplete(index, { resume, stepData })) {
                destination = index;
                break;
            }
        }
        router.push(applyStepHref(destination));
    };

    // Once submitted, the confirmation (Figma 1878:22273) shows without the stepper.
    if (submitted) return null;

    return (
        <ApplicationStepper
            currentIndex={currentIndex}
            maxVisited={Math.max(maxVisited, currentIndex)}
            onStepClick={handleStepClick}
        />
    );
}
