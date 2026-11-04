"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { sendRecoveryCode } from "@/lib/auth/codeActions";
import {
    AuthCard,
    FormMessage,
    SecondaryLink,
    SubmitButton,
    TextField,
} from "@/components/CommonComponents/AuthFormControls";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reset password card, in the same frame and controls as the sign-in card:
// registered email, send code, cancel back to sign-in. The server emails a
// 6-digit recovery code and the user goes on to /verify-otp.
export default function ResetYourPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;
        if (!EMAIL_PATTERN.test(email)) {
            setError("Enter a valid email address.");
            return;
        }

        setSubmitting(true);
        setError(null);
        const result = await sendRecoveryCode(email);
        setSubmitting(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    };

    return (
        <AuthCard
            titleId="reset-password-title"
            title="Reset Your Password"
            description="Enter your registered email address to receive a password reset verification code."
        >
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <TextField
                        id="email"
                        label="Email Address"
                        required
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError(null);
                        }}
                        placeholder="yourname@email.com"
                        invalid={Boolean(error)}
                        aria-describedby={error ? "reset-password-error" : undefined}
                    />
                    {error && <FormMessage id="reset-password-error">{error}</FormMessage>}
                </div>

                <div className="flex flex-col gap-2">
                    <SubmitButton busy={submitting}>
                        {submitting ? "Sending Code…" : "Send Verification Code"}
                    </SubmitButton>
                    <SecondaryLink href="/">Cancel</SecondaryLink>
                </div>
            </form>
        </AuthCard>
    );
}
