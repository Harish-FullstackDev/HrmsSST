"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { safeNext, withNext } from "@/lib/nextPath";
import { createClient } from "@/lib/supabase/client";
import PrivacyPolicy from "@/components/CommonComponents/PrivacyPolicy";
import {
    AuthCard,
    Checkbox,
    FormMessage,
    PasswordField,
    SubmitButton,
    TextField,
    textClass,
} from "@/components/CommonComponents/AuthFormControls";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Figma 1306:2612 "Login and signup" (Sign In): the sign-in card. Signs in
// with Supabase and goes to ?next= (the page that sent the visitor here,
// e.g. a job's apply link) or /dashboard. Create an Account keeps ?next=.
// Reads the query with useSearchParams, so the page wraps this in <Suspense>.
export default function SignInToYourAccount() {
    const router = useRouter();
    const next = safeNext(useSearchParams().get("next"));
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        if (!EMAIL_PATTERN.test(email)) {
            setError("Enter a valid email address.");
            return;
        }
        if (!password) {
            setError("Enter your password.");
            return;
        }

        setSubmitting(true);
        setError(null);
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        setSubmitting(false);

        if (signInError) {
            setError(
                signInError.code === "invalid_credentials"
                    ? "The email or password you entered is incorrect, please check again."
                    : signInError.message,
            );
            return;
        }

        router.push(next ?? "/dashboard");
        router.refresh();
    };

    const describedBy = error ? "sign-in-error" : undefined;

    return (
        <AuthCard
            titleId="sign-in-title"
            title="Sign In to Your Account"
            description="Enter your credentials to access your careers portal and manage your job applications."
        >
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
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
                    aria-describedby={describedBy}
                />

                <PasswordField
                    id="password"
                    label="Password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                    }}
                    placeholder="Enter your password"
                    invalid={Boolean(error)}
                    aria-describedby={describedBy}
                >
                    {error && <FormMessage id="sign-in-error">{error}</FormMessage>}
                </PasswordField>

                <div className={`flex items-center justify-between gap-4 ${textClass}`}>
                    <Checkbox
                        name="remember"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        boxClassName="rounded-[3px] border-border-default"
                    >
                        Remember me
                    </Checkbox>
                    <Link href="/forgot-password" className="text-action hover:underline">
                        Forgot Password?
                    </Link>
                </div>

                <SubmitButton busy={submitting}>{submitting ? "Signing In…" : "Sign In"}</SubmitButton>
            </form>

            <p className={textClass}>
                Don&apos;t have an account?{" "}
                <Link
                    href={withNext("/sign-up", next)}
                    className="text-action underline [text-underline-position:from-font] decoration-from-font hover:no-underline"
                >
                    Create an Account
                </Link>
            </p>

            <p className="text-xs leading-[18px] text-muted-ink">
                By signing in, you agree to our <PrivacyPolicy />.
            </p>
        </AuthCard>
    );
}
