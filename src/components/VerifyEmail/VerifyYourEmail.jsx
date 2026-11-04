"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { safeNext, withNext } from "@/lib/nextPath";
import { createClient } from "@/lib/supabase/client";
import { resendSignupCode, sendRecoveryCode, sendWelcomeEmail } from "@/lib/auth/codeActions";
import {
    AuthCard,
    FormMessage,
    SecondaryLink,
    SubmitButton,
    textClass,
} from "@/components/CommonComponents/AuthFormControls";

const CODE_LENGTH = 6;
const linkClass =
    "text-action underline [text-underline-position:from-font] decoration-from-font hover:no-underline";

// Figma 1306:2411 "Login and signup" (Verify your email): the step after
// sign-up. The server emails a 6-digit code (lib/auth/codeActions);
// verifying it signs the user in, emails "account created" and shows
// /email-verified. Reads the address from ?email=, so the page wraps this
// in <Suspense>. A sign-up's ?next= (see SignInToYourAccount) is passed on
// to /email-verified.
//
// The same card is the forgot-password OTP step (flow="recovery"): verifying
// the recovery code signs the user in and goes on to /reset-password.
const FLOWS = {
    signup: { type: "email", next: "/email-verified", changeEmailHref: "/sign-up" },
    recovery: { type: "recovery", next: "/reset-password", changeEmailHref: "/forgot-password" },
};

export default function VerifyYourEmail({ flow = "signup" }) {
    const { type, next, changeEmailHref } = FLOWS[flow];
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") ?? "";
    const returnTo = flow === "signup" ? safeNext(searchParams.get("next")) : null;
    const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const inputs = useRef([]);

    const focus = (index) => inputs.current[Math.max(0, Math.min(index, CODE_LENGTH - 1))]?.focus();

    const setDigit = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        setDigits((prev) => prev.map((d, i) => (i === index ? digit : d)));
        setError(null);
        if (digit) focus(index + 1);
    };

    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace" && !digits[index]) focus(index - 1);
        if (event.key === "ArrowLeft") focus(index - 1);
        if (event.key === "ArrowRight") focus(index + 1);
    };

    const handlePaste = (event) => {
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
        if (!pasted) return;
        event.preventDefault();
        setDigits(Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] ?? ""));
        setError(null);
        focus(pasted.length);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        const token = digits.join("");
        if (token.length < CODE_LENGTH) {
            setError(`Enter the ${CODE_LENGTH}-digit code from your email.`);
            return;
        }

        setSubmitting(true);
        setError(null);
        setNotice(null);
        const supabase = createClient();
        const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type });

        // New account confirmed: send the "account created" email. A failed
        // send is logged on the server and doesn't block the success page.
        if (!verifyError && flow === "signup") await sendWelcomeEmail().catch(() => {});
        setSubmitting(false);

        if (verifyError) {
            setError(
                verifyError.code === "otp_expired"
                    ? "This code is wrong or has expired. Check it, or resend a new one."
                    : verifyError.message,
            );
            return;
        }

        router.push(withNext(next, returnTo));
    };

    const handleResend = async () => {
        setError(null);
        setNotice(null);
        const result = await (flow === "recovery" ? sendRecoveryCode(email) : resendSignupCode(email));
        if (result.error) setError(result.error);
        else setNotice(`A new code is on its way to ${email}.`);
    };

    return (
        <AuthCard
            titleId="verify-email-title"
            title="Verify your email"
            description={
                // Figma: the sentence, an empty 14 line, then the address row,
                // all set solid (14 per line) for a 42 block.
                <span className="block leading-none">
                    We&apos;ve sent a {CODE_LENGTH}-digit verification code to your registered email address.
                    <span className="mt-[14px] flex items-center justify-between gap-4">
                        <span className="min-w-0 truncate text-muted-ink">{email}</span>
                        <Link href={withNext(changeEmailHref, returnTo)} className={`shrink-0 ${linkClass}`}>
                            Change Email
                        </Link>
                    </span>
                </span>
            }
        >
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                <fieldset className="flex flex-col">
                    <legend className={`mb-2 ${textClass}`}>
                        Verification Code <span className="text-required">*</span>
                    </legend>
                    <div className="flex justify-between gap-2" onPaste={handlePaste}>
                        {digits.map((digit, i) => (
                            <span key={i} className="relative h-14 w-[61px] min-w-0 shrink">
                                <input
                                    suppressHydrationWarning
                                    ref={(el) => (inputs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={i === 0 ? "one-time-code" : "off"}
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => setDigit(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onFocus={(e) => e.target.select()}
                                    aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                                    aria-invalid={error ? true : undefined}
                                    className={`peer size-full rounded-lg border bg-white text-center text-base text-ink outline-none transition-colors focus:border-action ${
                                        error ? "border-required" : "border-border-default"
                                    }`}
                                />
                                {/* Figma's empty-box mark: an 18×2 dash. */}
                                {!digit && (
                                    <span
                                        aria-hidden
                                        className="pointer-events-none absolute top-1/2 left-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-[#d9d9d9] peer-focus:hidden"
                                    />
                                )}
                            </span>
                        ))}
                    </div>
                </fieldset>

                {error && <FormMessage>{error}</FormMessage>}
                {notice && <FormMessage tone="success">{notice}</FormMessage>}

                <div className="flex flex-col gap-2">
                    <SubmitButton busy={submitting}>{submitting ? "Verifying…" : "Verify OTP"}</SubmitButton>
                    <SecondaryLink href="/">Cancel</SecondaryLink>
                </div>
            </form>

            <p className={textClass}>
                Didn&apos;t receive the code?{" "}
                <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleResend}
                    className={`cursor-pointer ${linkClass}`}
                >
                    Resend Code
                </button>
            </p>
        </AuthCard>
    );
}
