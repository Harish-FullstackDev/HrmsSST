import { register } from "node:module";

register("./resolve.mjs", import.meta.url);

// Tests never send real email: without SMTP_* the mailer only logs.
for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]) delete process.env[key];
