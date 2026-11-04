import { emailButton, escapeHtml, renderHtml, send } from "./mailer";

// Sends the auth emails (6-digit codes and the account-created welcome) from
// the app instead of Supabase's mailer. SMTP_* comes from .env.local; without
// it (local dev) the email is summarised in the `npm run dev` terminal instead
// (see ./mailer).

const CONTENT = {
    signup: {
        subject: (code) => `Your Ascendus verification code: ${code}`,
        title: "Verify your email",
        intro: (email) =>
            `Thanks for creating your careers account. Enter this code on the verification page to confirm <strong>${email}</strong>:`,
        outro: "This code expires in 1 hour. If you didn't create an account, you can ignore this email.",
    },
    recovery: {
        subject: (code) => `Your Ascendus password reset code: ${code}`,
        title: "Reset your password",
        intro: (email) =>
            `We received a request to reset the password for <strong>${email}</strong>. Enter this verification code to continue:`,
        outro: "This code expires in 1 hour. If you didn't ask to reset your password, ignore this email. Your password will stay the same.",
    },
};

// kind: "signup" | "recovery".
export async function sendCodeEmail(kind, email, code) {
    const content = CONTENT[kind];
    await send({
        to: email,
        subject: content.subject(code),
        text: `${content.title}\n\nYour code: ${code}\n\n${content.outro}`,
        html: renderHtml({
            title: content.title,
            intro: content.intro(escapeHtml(email)),
            middle: `<div style="display:inline-block;padding:16px 28px;border:1px solid #c9d0d8;border-radius:8px;background:#f8fafc;font-size:32px;font-weight:bold;letter-spacing:10px;color:#0e2b4b;">${code}</div>`,
            outro: content.outro,
        }),
        devLine: `${kind} code for ${email}: ${code}`,
    });
}

// Sent once, after the sign-up code is verified. `signInUrl` is optional;
// without it the email has no button.
export async function sendAccountCreatedEmail(email, firstName, signInUrl) {
    const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";
    const outro = "If you didn't create this account, contact us so we can secure it.";
    const button = signInUrl ? emailButton(signInUrl, "Sign In") : "";
    await send({
        to: email,
        subject: "Your Ascendus Careers account is ready",
        text:
            `${firstName ? `Hi ${firstName},` : "Hi,"}\n\n` +
            `Your careers account for ${email} has been created and your email is verified. ` +
            `You can now sign in, build your profile and apply for jobs.` +
            `${signInUrl ? `\n\nSign in: ${signInUrl}` : ""}\n\n${outro}`,
        html: renderHtml({
            title: "Account created successfully",
            intro:
                `${greeting}<br><br>Your careers account for <strong>${escapeHtml(email)}</strong> has been created and your email is verified. ` +
                "You can now sign in, build your profile and apply for jobs.",
            middle: button,
            outro,
        }),
        devLine: `account-created email for ${email}${signInUrl ? ` (sign-in link ${signInUrl})` : ""}`,
    });
}
