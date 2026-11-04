import nodemailer from "nodemailer";

// The app's one mailer (Nodemailer over SMTP) and the shared email card.
// SMTP_* comes from .env.local; without it (local dev) each email is
// summarised in the `npm run dev` terminal instead of being sent.
// Server code only.

export const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// A blue call-to-action button for the card's middle block.
export const emailButton = (href, label) =>
    `<a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 28px;border-radius:8px;background:#0061af;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">${escapeHtml(label)}</a>`;

// A two-column list of label / value rows (values are escaped here).
export const emailDetails = (rows) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc;">${rows
        .filter(([, value]) => value)
        .map(
            ([label, value]) =>
                `<tr><td style="padding:8px 16px;font-size:13px;color:#5c7088;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:8px 16px;font-size:13px;font-weight:600;color:#0e2b4b;">${escapeHtml(value)}</td></tr>`,
        )
        .join("")}</table>`;

// The shared card: brand, uppercase title, intro, a middle block (code box,
// details or button) and a muted closing line. `intro`, `middle` and
// `outro` are HTML; escape anything user-supplied before passing it in.
export function renderHtml({ title, intro, middle = "", outro }) {
    return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#0e2b4b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;">
            <tr><td style="padding:32px 32px 0;font-size:20px;font-weight:bold;color:#0061af;">Ascendus Careers</td></tr>
            <tr><td style="padding:24px 32px 0;font-size:14px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">${escapeHtml(title)}</td></tr>
            <tr><td style="padding:16px 32px 0;font-size:14px;line-height:20px;">${intro}</td></tr>
            <tr><td align="center" style="padding:24px 32px;">${middle}</td></tr>
            <tr><td style="padding:0 32px 32px;font-size:13px;line-height:20px;color:#5c7088;">${outro}</td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#5c7088;">&copy; Ascendus Careers Portal</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

let transporter;
function getTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
    const port = Number(SMTP_PORT || 587);
    transporter ??= nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s/g, "") },
    });
    return transporter;
}

// Sends the mail, or prints `devLine` when SMTP_* isn't set. `to` is one
// address or a list; `bcc` keeps a list of recipients hidden from each other.
export async function send({ to, bcc, subject, text, html, devLine }) {
    const smtp = getTransporter();
    if (!smtp) {
        console.log(`\n[email] ${devLine}  (SMTP_* not set, email not sent)\n`);
        return;
    }
    const from = process.env.SMTP_FROM || `"Ascendus Careers" <${process.env.SMTP_USER}>`;
    await smtp.sendMail({ from, to: to ?? from, bcc, subject, text, html });
}
