"use server";

import { headers } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendAccountCreatedEmail, sendCodeEmail } from "@/lib/email/sendCodeEmail";

// Server Actions that create the 6-digit auth codes with Supabase's admin
// generateLink (which sends nothing) and email them from the app. The pages
// still check the code in the browser with supabase.auth.verifyOtp.
//
// These are public endpoints: each one validates its input, waits a minute
// between codes for the same address and never tells a caller whether an
// address has an account (except sign-up, which has to).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_MS = 60_000;
const lastSent = new Map();

const normalise = (email) => String(email ?? "").trim().toLowerCase();

function cooldownError(email) {
    const wait = (lastSent.get(email) ?? 0) + COOLDOWN_MS - Date.now();
    if (wait <= 0) return null;
    return `Please wait ${Math.ceil(wait / 1000)} seconds before requesting another code.`;
}

// generateLink creates a user for an unknown address (even for "magiclink"
// and "recovery"), so every action looks the address up first. The admin
// users endpoint's `filter` matches substrings, hence the exact compare.
async function findUser(email) {
    const url = new URL("/auth/v1/admin/users", process.env.NEXT_PUBLIC_SUPABASE_URL);
    url.searchParams.set("filter", email);
    url.searchParams.set("per_page", "50");
    const key = process.env.SUPABASE_SECRET_KEY;
    const res = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
    if (!res.ok) throw new Error(`Supabase user lookup failed (${res.status})`);
    const { users = [] } = await res.json();
    return users.find((u) => u.email?.toLowerCase() === email) ?? null;
}

async function deliver(kind, email, code) {
    try {
        await sendCodeEmail(kind, email, code);
        lastSent.set(email, Date.now());
        return { ok: true };
    } catch (err) {
        console.error(`[auth] sending ${kind} code failed:`, err);
        return { error: "We couldn't send the email. Please try again in a moment." };
    }
}

// Sign-up: creates the unconfirmed user (name in metadata) and emails the
// code that confirms it. An address that signed up before but never
// confirmed gets its password and name updated and a fresh code.
export async function signUpWithCode({ email, password, firstName, lastName }) {
    email = normalise(email);
    if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." };
    if (!password || password.length < 6) return { error: "Password should be at least 6 characters." };
    const busy = cooldownError(email);
    if (busy) return { error: busy };

    const data = { first_name: String(firstName ?? "").trim(), last_name: String(lastName ?? "").trim() };
    const admin = createAdminClient();
    const user = await findUser(email);

    if (!user) {
        const created = await admin.auth.admin.generateLink({ type: "signup", email, password, options: { data } });
        if (created.error) return { error: created.error.message };
        return deliver("signup", email, created.data.properties.email_otp);
    }
    if (user.email_confirmed_at) return { error: "An account with this email already exists. Sign in instead." };

    const updated = await admin.auth.admin.updateUserById(user.id, { password, user_metadata: data });
    if (updated.error) return { error: updated.error.message };
    const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (link.error) return { error: link.error.message };
    return deliver("signup", email, link.data.properties.email_otp);
}

// "Resend Code" on /verify-email: only unconfirmed accounts get a code.
export async function resendSignupCode(email) {
    email = normalise(email);
    if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." };
    const busy = cooldownError(email);
    if (busy) return { error: busy };

    const user = await findUser(email);
    if (!user || user.email_confirmed_at) return { ok: true };

    const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "magiclink", email });
    if (error) return { error: error.message };
    return deliver("signup", email, data.properties.email_otp);
}

// After the sign-up code is verified: emails "account created" to the
// signed-in user, once. Takes no input; the session cookie decides who gets
// it, and app_metadata.welcome_email_sent_at (which users can't edit) stops
// repeats.
export async function sendWelcomeEmail() {
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (!user?.email || !user.email_confirmed_at || user.app_metadata?.welcome_email_sent_at) return { ok: true };

    const admin = createAdminClient();
    const mark = (value) =>
        admin.auth.admin.updateUserById(user.id, { app_metadata: { welcome_email_sent_at: value } });

    const marked = await mark(new Date().toISOString());
    if (marked.error) return { error: marked.error.message };

    const origin = (await headers()).get("origin");
    try {
        await sendAccountCreatedEmail(user.email, user.user_metadata?.first_name, origin ? `${origin}/` : null);
        return { ok: true };
    } catch (err) {
        console.error("[auth] sending account-created email failed:", err);
        await mark(null);
        return { error: "We couldn't send the email." };
    }
}

// Forgot password (and its "Resend Code"): emails a recovery code if the
// address has an account; answers the same either way.
export async function sendRecoveryCode(email) {
    email = normalise(email);
    if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." };
    const busy = cooldownError(email);
    if (busy) return { error: busy };

    if (!(await findUser(email))) return { ok: true };

    const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "recovery", email });
    if (error) return { error: error.message };
    return deliver("recovery", email, data.properties.email_otp);
}
