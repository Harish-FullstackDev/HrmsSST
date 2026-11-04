"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SECTIONS = [
    {
        heading: "Information We Collect",
        body: "We may collect your name, email address, contact details, resume, employment history, education, and other information you provide during registration or job applications.",
    },
    {
        heading: "How We Use Your Information",
        body: "Your information is used to manage your account, process job applications, assess your qualifications, and communicate recruitment updates.",
    },
    {
        heading: "Information Sharing",
        body: "Your information may be shared with authorized recruitment personnel and relevant teams involved in the hiring process.",
    },
    {
        heading: "Data Privacy",
        body: "We take your privacy seriously and have measures in place to protect your personal information.",
    },
    {
        heading: "Retention Policy",
        body: "Your data will be retained only for as long as necessary to fulfill the purposes described in this policy, or as required by applicable law.",
    },
];

// The Privacy Policy modal from the auth screens: a link-styled button that
// opens a native <dialog> (Esc, the Close button or a click on the dimmed
// backdrop closes it). The section list scrolls inside the card. The dialog
// is portalled to <body> because sign-up puts the button inside the
// checkbox's <label>, where any click in the dialog would toggle the box.
export default function PrivacyPolicy({ className = "", children = "Privacy Policy" }) {
    const dialog = useRef(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) dialog.current?.showModal();
    }, [open]);

    return (
        <>
            <button
                type="button"
                suppressHydrationWarning
                onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                }}
                className={`cursor-pointer text-action underline [text-underline-position:from-font] decoration-from-font hover:no-underline ${className}`}
            >
                {children}
            </button>

            {open &&
                createPortal(
                    <dialog
                        ref={dialog}
                        aria-labelledby="privacy-policy-title"
                        onClose={() => setOpen(false)}
                        onClick={(e) => e.target === e.currentTarget && dialog.current.close()}
                        className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[555px] rounded-3xl bg-white p-0 text-ink shadow-xl backdrop:bg-black/40"
                    >
                        <div className="flex max-h-[min(661px,calc(100dvh-32px))] flex-col gap-6 px-6 py-8 sm:px-[46px] sm:pt-[38px] sm:pb-8">
                            <header className="flex flex-col gap-2">
                                <h2 id="privacy-policy-title" className="text-base leading-6 font-medium">
                                    Privacy Policy
                                </h2>
                                <p className="text-xs leading-[18px] text-muted-ink italic">
                                    Please review how we collect, use, and protect your personal information when you
                                    use our Careers Portal.
                                </p>
                            </header>

                            <div className="-mr-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-2">
                                {SECTIONS.map(({ heading, body }) => (
                                    <section key={heading} className="flex flex-col gap-2 pb-2">
                                        <h3 className="text-lg leading-6 font-medium text-action">{heading}</h3>
                                        <p className="text-sm leading-5">{body}</p>
                                    </section>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => dialog.current.close()}
                                className="ml-auto h-10 w-[155px] cursor-pointer rounded-lg border border-action bg-white text-base text-action transition-colors hover:bg-action/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                            >
                                Close
                            </button>
                        </div>
                    </dialog>,
                    document.body,
                )}
        </>
    );
}
