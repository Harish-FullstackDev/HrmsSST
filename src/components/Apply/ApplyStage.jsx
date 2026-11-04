"use client";

import { useApplyDirection } from "@/components/Apply/ApplyShell";

// Full class strings so Tailwind picks them up; keyframes are in globals.css.
// Fill mode is backwards, not both: a finished animation that still fills a
// transform keeps a stacking context, which traps dropdown lists under the
// content after them. The keyframes only set `from`, so nothing else changes.
const stepAnimation = {
    next: "motion-safe:animate-[apply-step-in-next_450ms_cubic-bezier(0.22,1,0.36,1)_backwards]",
    back: "motion-safe:animate-[apply-step-in-back_450ms_cubic-bezier(0.22,1,0.36,1)_backwards]",
};

// Wraps a stage's content so it slides in from the side it comes from (right
// on Next, left on Back) while fading in. It sits inside the page rather than
// the layout, so the movement plays on the real content and not on the
// loading skeleton. Reduced-motion users get the change without movement.
export default function ApplyStage({ className = "", children }) {
    const direction = useApplyDirection();
    return <div className={`w-full ${stepAnimation[direction]} ${className}`}>{children}</div>;
}
