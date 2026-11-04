"use client";

import { useSearchParams } from "next/navigation";

import AuthSuccessCard from "@/components/CommonComponents/AuthSuccessCard";
import { safeNext, withNext } from "@/lib/nextPath";

// Shown after the sign-up email code is verified. The user is signed in by
// then, so Sign in (/) passes straight through to ?next= (e.g. the job they
// were applying for) or the dashboard (see proxy.js). The page wraps this in
// <Suspense> for useSearchParams.
export default function EmailVerifiedSuccessfully() {
    const next = safeNext(useSearchParams().get("next"));
    return <AuthSuccessCard titleId="email-verified-title" title="Email Verified Successfully!" href={withNext("/", next)} />;
}
