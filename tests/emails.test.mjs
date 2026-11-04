import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, mock, test } from "node:test";

import {
    STATUS_EMAIL_STATUSES,
    sendApplicationReceivedEmail,
    sendJobPublishedEmail,
    sendQuietly,
    sendStatusChangeEmail,
} from "../src/lib/email/hiringEmails.js";
import { emailDetails, escapeHtml, renderHtml } from "../src/lib/email/mailer.js";

const JOB = {
    job_code: "SST-2026-005",
    slug: "ui-designer-asc-2026-005",
    title: "UI Designer",
    department: "Design",
    location: "Chennai",
    type_of_work: "Full-time",
    mode_of_work: "Hybrid",
    vacancies: 2,
    closes_on: "2026-12-01",
    status: "published",
};

// Without SMTP_* (tests/setup/register.mjs) the mailer logs one line per email.
let logs;
beforeEach(() => {
    logs = [];
    mock.method(console, "log", (line) => logs.push(String(line)));
});
afterEach(() => mock.restoreAll());

describe("mailer", () => {
    test("escapeHtml escapes every special character", () => {
        assert.equal(escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
        assert.equal(escapeHtml(42), "42");
    });

    test("user text can't inject HTML into the card", () => {
        const html = renderHtml({ title: "<img src=x onerror=alert(1)>", intro: "", outro: "" });
        assert.ok(!html.includes("<img"));
        const details = emailDetails([["Position", "<b>Boss</b>"]]);
        assert.ok(details.includes("&lt;b&gt;Boss&lt;/b&gt;"));
    });

    test("details skip empty rows", () => {
        const details = emailDetails([
            ["Shown", "yes"],
            ["Hidden", ""],
            ["Missing", null],
        ]);
        assert.ok(details.includes("Shown"));
        assert.ok(!details.includes("Hidden"));
        assert.ok(!details.includes("Missing"));
    });
});

describe("hiring emails without SMTP", () => {
    test("application received logs instead of sending", async () => {
        await sendApplicationReceivedEmail({ email: "a@example.com", firstName: "Asha", reference: "APP-2026-0003", job: JOB, origin: null });
        assert.equal(logs.length, 1);
        assert.match(logs[0], /application-received email to a@example\.com for APP-2026-0003/);
    });

    test("no address, no email", async () => {
        await sendApplicationReceivedEmail({ email: "", firstName: "Asha", reference: "APP-2026-0003", job: JOB, origin: null });
        assert.equal(logs.length, 0);
    });

    test("job published goes to all HR at once", async () => {
        await sendJobPublishedEmail({
            recipients: ["hr1@example.com", "hr2@example.com"],
            job: JOB,
            publishedBy: { first_name: "Harish", last_name: "D" },
            origin: "http://localhost:3000",
        });
        assert.equal(logs.length, 1);
        assert.match(logs[0], /job-published email to 2 HR account\(s\) for SST-2026-005/);
    });

    test("no HR accounts, no email", async () => {
        await sendJobPublishedEmail({ recipients: [], job: JOB, publishedBy: null, origin: null });
        assert.equal(logs.length, 0);
    });

    test("a job with missing optional fields still sends", async () => {
        const bare = { job_code: "SST-2026-006", title: "Intern", slug: null, closes_on: null, vacancies: null };
        await sendJobPublishedEmail({ recipients: ["hr@example.com"], job: bare, publishedBy: undefined, origin: null });
        assert.equal(logs.length, 1);
    });
});

describe("stage emails", () => {
    const base = { email: "a@example.com", firstName: "Asha", reference: "APP-2026-0003", job: JOB, origin: null };

    test("job offer, onboarding and rejected each send", async () => {
        for (const status of ["offer", "hired", "rejected"]) {
            await sendStatusChangeEmail({ ...base, status });
        }
        assert.equal(logs.length, 3);
        assert.match(logs[0], /offer email to a@example\.com for APP-2026-0003/);
        assert.match(logs[2], /rejected email/);
    });

    test("other stages, no address or no job send nothing", async () => {
        await sendStatusChangeEmail({ ...base, status: "screening" });
        await sendStatusChangeEmail({ ...base, status: "offer", email: "" });
        await sendStatusChangeEmail({ ...base, status: "offer", job: null });
        assert.equal(logs.length, 0);
    });

    test("only the confirmed stages email", () => {
        assert.deepEqual([...STATUS_EMAIL_STATUSES].sort(), ["hired", "offer", "rejected"]);
    });
});

describe("sendQuietly", () => {
    test("a failing send is logged, not thrown", async () => {
        const errors = [];
        mock.method(console, "error", (...args) => errors.push(args));
        await assert.doesNotReject(
            sendQuietly("Test", async () => {
                throw new Error("SMTP down");
            }),
        );
        assert.equal(errors.length, 1);
        assert.match(String(errors[0][0]), /Test email failed/);
    });
});
