const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let smtp;
function smtpTransport() {
  if (!smtp) smtp = require('nodemailer').createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS.replace(/\s/g, '') },
    connectionTimeout: 8000, socketTimeout: 10000,
  });
  return smtp;
}
const configured = () => !!((process.env.SMTP_USER && process.env.SMTP_PASS) || process.env.RESEND_API_KEY);

/** One sender for everything. Gmail SMTP (App Password) can email anyone; Resend can email anyone only once a domain is verified. */
async function sendMail({ to, subject, text, html, replyTo }) {
  const { SMTP_USER, SMTP_PASS, RESEND_API_KEY, MAIL_FROM } = process.env;
  if (SMTP_USER && SMTP_PASS) {
    await smtpTransport().sendMail({ from: `"Rijuan Portfolio" <${SMTP_USER}>`, to, subject, text, html, replyTo });
    return true;
  }
  if (RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: MAIL_FROM || 'Portfolio <onboarding@resend.dev>', to: [to], reply_to: replyTo, subject, text, html }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
    return true;
  }
  throw new Error('Mail is not configured');
}

const label = 'margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.1em';

/** Emails the verified visitor message to the portfolio owner. */
async function notify({ name, email, message }) {
  if (!configured()) return false;
  const clean = name.replace(/[\r\n"<>]/g, ' ').trim();
  await sendMail({
    to: process.env.MAIL_TO || process.env.SMTP_USER,
    replyTo: `${clean} <${email}>`,
    subject: `New portfolio message from ${clean}`,
    text: `New portfolio message\n\nName: ${clean}\nEmail: ${email} (verified)\nMessage: ${message}\n\nHit Reply to answer directly.`,
    html: `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
<div style="background:#059669;color:#fff;padding:18px 22px;font-size:18px;font-weight:600">New portfolio message</div>
<div style="padding:22px;color:#0f172a">
<p style="${label}">Name</p><p style="margin:4px 0 20px;font-size:16px">${esc(clean)}</p>
<p style="${label}">Email</p><p style="margin:4px 0 20px;font-size:16px"><a href="mailto:${esc(email)}" style="color:#059669;text-decoration:none">${esc(email)}</a> <span style="color:#059669;font-size:12px">&#10003; verified</span></p>
<p style="${label}">Message</p><div style="margin-top:6px;padding:14px 16px;background:#f1f5f9;border-radius:10px;white-space:pre-wrap;line-height:1.6">${esc(message)}</div>
</div>
<div style="padding:14px 22px;background:#f8fafc;color:#64748b;font-size:12px">Hit Reply to answer directly.</div></div>`,
  });
  return true;
}

/** Emails the 6-digit verification code to the visitor. */
async function sendCode(email, code) {
  if (!configured()) throw new Error('Mail is not configured');
  await sendMail({
    to: email,
    subject: `${code} is your verification code`,
    text: `Your verification code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:420px;margin:auto;padding:28px;border:1px solid #e2e8f0;border-radius:16px;text-align:center">
<p style="margin:0 0 6px;color:#64748b">Your verification code</p>
<p style="margin:0;font-size:36px;letter-spacing:10px;font-weight:700;color:#059669">${esc(code)}</p>
<p style="margin:18px 0 0;color:#64748b;font-size:13px">It expires in 10 minutes. If you didn't request it, ignore this email.</p></div>`,
  });
}
module.exports = { notify, sendCode };
