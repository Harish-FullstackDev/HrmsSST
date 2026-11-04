"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import {
    AuthCard,
    FormMessage,
    PasswordField,
    SecondaryLink,
    SubmitButton,
    textClass,
} from "@/components/CommonComponents/AuthFormControls";

const MIN_LENGTH = 8;

const REQUIREMENTS = [
    { label: "At least One Letter", test: (p) => /[a-zA-Z]/.test(p) },
    { label: "At least One capital Letter", test: (p) => /[A-Z]/.test(p) },
    { label: "At least One Number", test: (p) => /\d/.test(p) },
    { label: `Be at Least ${MIN_LENGTH} Characters`, test: (p) => p.length >= MIN_LENGTH },
];

// "Create a new password" card, the last step of forgot-password. The user is
// signed in by the recovery code (/verify-otp), so the password is set with
// updateUser and the flow ends on /reset-password/success.
export default function UpdateYourPassword() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const results = REQUIREMENTS.map((r) => ({ ...r, met: r.test(password) }));
    const mismatch = confirmation.length > 0 && confirmation !== password;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        if (!results.every((r) => r.met)) {
            setError("Your new password doesn't meet all the requirements.");
            return;
        }
        if (confirmation !== password) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);
        setError(null);
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setSubmitting(false);
            setError(updateError.message);
            return;
        }

        // End the recovery session so the user signs in with the new password.
        await supabase.auth.signOut();
        setSubmitting(false);

        router.push("/reset-password/success");
    };

    return (
        <AuthCard
            titleId="new-password-title"
            title="Create a New Password"
            description="Choose a strong password to secure your careers account."
        >
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                <PasswordField
                    id="new-password"
                    label="New Password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                    }}
                    placeholder="Enter New Password"
                    aria-describedby="password-requirements"
                />

                <PasswordField
                    id="confirm-password"
                    label="Confirm New Password"
                    required
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(e) => {
                        setConfirmation(e.target.value);
                        setError(null);
                    }}
                    placeholder="Re-enter New Password"
                    invalid={mismatch}
                    aria-describedby={error ? "new-password-error" : undefined}
                >
                    {error && <FormMessage id="new-password-error">{error}</FormMessage>}
                </PasswordField>

                <div className="flex flex-col gap-3">
                    <p className={textClass}>Password requirements</p>
                    <ul id="password-requirements" className="flex flex-col gap-1.5">
                        {results.map(({ label, met }) => (
                            <li
                                key={label}
                                className={`flex items-center gap-2 text-xs leading-4 transition-colors ${
                                    met ? "text-success" : "text-muted-ink"
                                }`}
                            >
                                <span
                                    aria-hidden
                                    className={`size-2 shrink-0 rounded-full ${met ? "bg-success" : "bg-[#d9d9d9]"}`}
                                />
                                <span className="sr-only">{met ? "Met: " : "Not met: "}</span>
                                {label}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col gap-2">
                    <SubmitButton busy={submitting}>{submitting ? "Resetting…" : "Reset Password"}</SubmitButton>
                    <SecondaryLink href="/">Cancel</SecondaryLink>
                </div>
            </form>
        </AuthCard>
    );
}
