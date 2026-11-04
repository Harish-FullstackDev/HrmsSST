"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

import stepCheck from "@/assets/Apply/icons/step-check.svg";
import { applySteps } from "@/components/Apply/applySteps";

// Figma 1919:4442: a 100-tall light-blue panel (12 radius, 32/16 padding)
// with the six stages spread edge to edge (the first label starts at the
// left padding, the last ends at the right, equal gaps between), each a 32px
// white circle over its 14px label, 16 apart. A 3px light rail joins the
// circles; the blue part runs up to the current stage and slides along when
// it changes. The current stage's circle has a blue ring; stages before it
// turn blue with a check and a blue label. Below xl the labels would collide,
// so only the current stage's name is shown under the circles.
//
// Stages up to `maxVisited` (other than the current one) are buttons that
// call `onStepClick(index)`; later stages stay plain until reached.
export default function ApplicationStepper({ currentIndex, maxVisited = currentIndex, onStepClick }) {
    const count = applySteps.length;
    const filledTo = Math.min(currentIndex, count - 1);

    // The labels differ in width, so the circle centres are measured (and
    // re-measured on resize) for the rail's ends.
    const panelRef = useRef(null);
    const circleRefs = useRef([]);
    const [centres, setCentres] = useState(null);
    useLayoutEffect(() => {
        const panel = panelRef.current;
        const measure = () => {
            const left = panel.getBoundingClientRect().left;
            setCentres(
                circleRefs.current.map((circle) => {
                    const box = circle.getBoundingClientRect();
                    return box.left + box.width / 2 - left;
                }),
            );
        };
        measure();
        // The steps too, as their labels change width when the font loads.
        const observer = new ResizeObserver(measure);
        observer.observe(panel);
        circleRefs.current.forEach((circle) => observer.observe(circle.parentElement));
        return () => observer.disconnect();
    }, []);

    return (
        <nav aria-label="Application progress" className="w-full">
            <div ref={panelRef} className="relative rounded-xl bg-surface-brand-subtle px-2 py-4 lg:h-[100px] lg:px-8">
                {centres && (
                    <div aria-hidden="true" className="absolute inset-x-0 top-[30.5px]">
                        <span
                            className="absolute h-[3px] rounded-full bg-[#8bb0da]"
                            style={{ left: centres[0], width: centres[count - 1] - centres[0] }}
                        />
                        <span
                            className="absolute h-[3px] rounded-full bg-action transition-[width] duration-500 ease-out motion-reduce:transition-none"
                            style={{ left: centres[0], width: centres[filledTo] - centres[0] }}
                        />
                    </div>
                )}
                <ol className="relative flex w-full items-start justify-between">
                    {applySteps.map(({ slug, label }, index) => {
                        const done = index < currentIndex;
                        const current = index === currentIndex;
                        const clickable = Boolean(onStepClick) && !current && index <= maxVisited;
                        const StepTag = clickable ? "button" : "div";

                        return (
                            <li key={slug} className="flex justify-center">
                                <StepTag
                                    {...(clickable
                                        ? { type: "button", onClick: () => onStepClick(index), "aria-label": `Go to ${label}` }
                                        : {})}
                                    className={`flex flex-col items-center gap-4 rounded-lg outline-offset-4 ${
                                        clickable ? "group cursor-pointer" : ""
                                    }`}
                                    aria-current={current ? "step" : undefined}
                                >
                                    <span
                                        ref={(node) => {
                                            circleRefs.current[index] = node;
                                        }}
                                        className={`relative flex size-8 items-center justify-center rounded-full border transition-[background-color,border-color,box-shadow] duration-300 group-hover:ring-4 group-hover:ring-primary-200/60 motion-reduce:transition-none ${
                                            done
                                                ? "border-action bg-action drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
                                                : current
                                                  ? "border-action bg-white"
                                                  : "border-transparent bg-white"
                                        }`}
                                    >
                                        <span
                                            className={`text-sm leading-4 font-medium tracking-[0.7px] text-navy-900 transition-opacity duration-200 motion-reduce:transition-none ${
                                                done ? "opacity-0" : "opacity-100"
                                            }`}
                                        >
                                            {index + 1}
                                        </span>
                                        <Image
                                            src={stepCheck}
                                            alt=""
                                            width={10.87}
                                            height={8.02}
                                            className={`absolute transition-[opacity,scale] duration-300 motion-reduce:transition-none ${
                                                done ? "scale-100 opacity-100" : "scale-50 opacity-0"
                                            }`}
                                        />
                                    </span>
                                    <span
                                        className={`hidden text-center text-sm leading-[1.4] whitespace-nowrap transition-colors duration-300 xl:block ${
                                            done ? "text-action" : "text-ink"
                                        }`}
                                    >
                                        {label}
                                        {done && <span className="sr-only"> (completed)</span>}
                                    </span>
                                </StepTag>
                            </li>
                        );
                    })}
                </ol>
            </div>
            <p className="mt-3 text-sm leading-5 text-ink xl:hidden">
                {currentIndex >= count
                    ? "All steps completed"
                    : `Step ${currentIndex + 1} of ${count}: ${applySteps[currentIndex].label}`}
            </p>
        </nav>
    );
}
