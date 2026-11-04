// Checks a reCAPTCHA v2 token with Google. Server code only: the submit
// Server Action calls it, so the check can't be skipped by calling the
// action directly. Returns { ok: true } or { ok: false, error }.
//
// Without RECAPTCHA_SECRET_KEY, development uses Google's public test secret,
// which accepts the test site key's tokens (see Recaptcha.jsx). Production
// refuses every token until the secret is set.

const TEST_SECRET = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
const FAILED = "Please complete the \"I'm not a robot\" check again.";

export async function verifyRecaptcha(token) {
    const secret =
        process.env.RECAPTCHA_SECRET_KEY || (process.env.NODE_ENV !== "production" ? TEST_SECRET : "");
    if (!secret) {
        console.error("verifyRecaptcha: RECAPTCHA_SECRET_KEY is not set");
        return { ok: false, error: "The security check isn't available right now. Please try again later." };
    }
    if (typeof token !== "string" || !token || token.length > 4000) return { ok: false, error: FAILED };

    try {
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ secret, response: token }),
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
        });
        const result = await response.json();
        return result.success ? { ok: true } : { ok: false, error: FAILED };
    } catch (error) {
        console.error("verifyRecaptcha: siteverify request failed", error);
        return { ok: false, error: "The security check couldn't be completed. Please try again." };
    }
}
