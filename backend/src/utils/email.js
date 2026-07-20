import nodemailer from "nodemailer";
import { config } from "../config/env.js";

// Prefer Gmail SMTP when configured — it delivers to any recipient.
// Fall back to the configured SMTP (Resend) only if Gmail isn't set.
const useGmail = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (useGmail) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    return transporter;
  }
  if (!process.env.SMTP_USERNAME) {
    // Dev mode: don't send, just log.
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: { user: process.env.SMTP_USERNAME, pass: process.env.SMTP_PASSWORD },
  });
  return transporter;
}

async function deliver(message) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email:dev] would send to ${message.to}: ${message.text}`);
    return;
  }
  await t.sendMail({ ...message, from });
}

const from = process.env.EMAIL_FROM || "Byparsathy <onboarding@resend.dev>";

function otpHtml(code) {
  const digits = code
    .split("")
    .map(
      (d) =>
        `<td style="width:44px;height:56px;background:#f0f4fe;border-radius:10px;font-size:26px;line-height:1;font-weight:700;color:#020520;font-family:'Inter',Arial,sans-serif;text-align:center;vertical-align:middle;">${d}</td>`
    )
    .join('<td style="width:10px;"></td>');
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fcfcfc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fcfcfc;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:16px;border:1px solid #ececf1;box-shadow:0 1px 3px rgba(2,5,32,0.06);overflow:hidden;font-family:'Inter',Arial,sans-serif;">
        <tr><td style="padding:28px 32px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:32px;height:32px;border-radius:8px;background:#145aff;color:#fff;font-size:18px;font-weight:700;text-align:center;line-height:32px;">B</td>
            <td style="padding-left:10px;font-size:17px;font-weight:700;color:#020520;letter-spacing:-0.2px;">Byparsathy</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:24px 32px 0;">
          <h1 style="margin:0;font-size:22px;line-height:1.25;font-weight:600;color:#020520;letter-spacing:-0.3px;">Your security code</h1>
          <p style="margin:10px 0 0;font-size:15px;line-height:1.55;color:#696a72;">Use the code below to continue. This code is valid for <strong style="color:#374151;">10 minutes</strong> and can only be used once.</p>
        </td></tr>
        <tr><td style="padding:24px 32px 0;" align="center">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>${digits}</tr></table>
        </td></tr>
        <tr><td style="padding:24px 32px 8px;">
          <p style="margin:0;font-size:13px;line-height:1.5;color:#95959b;">If you didn't request this code, you can safely ignore this email. No action is needed and your account stays secure.</p>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #f0f0f3;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#b3b3ba;">© 2026 Byparsathy. All rights reserved.<br>This is an automated message — please do not reply.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function verifyHtml(link) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fcfcfc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fcfcfc;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:16px;border:1px solid #ececf1;box-shadow:0 1px 3px rgba(2,5,32,0.06);overflow:hidden;font-family:'Inter',Arial,sans-serif;">
        <tr><td style="padding:28px 32px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:32px;height:32px;border-radius:8px;background:#145aff;color:#fff;font-size:18px;font-weight:700;text-align:center;line-height:32px;">B</td>
            <td style="padding-left:10px;font-size:17px;font-weight:700;color:#020520;letter-spacing:-0.2px;">Byparsathy</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:24px 32px 0;">
          <h1 style="margin:0;font-size:22px;line-height:1.25;font-weight:600;color:#020520;letter-spacing:-0.3px;">Confirm your email</h1>
          <p style="margin:10px 0 0;font-size:15px;line-height:1.55;color:#696a72;">Thanks for signing up. Verify your email address to activate your account and start using Byparsathy.</p>
        </td></tr>
        <tr><td style="padding:24px 32px 0;" align="center">
          <a href="${link}" style="display:inline-block;background:#145aff;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 32px;border-radius:12px;font-family:'Inter',Arial,sans-serif;">Verify email address</a>
        </td></tr>
        <tr><td style="padding:18px 32px 0;">
          <p style="margin:0;font-size:13px;line-height:1.5;color:#95959b;">Or paste this link into your browser:<br><span style="color:#374151;word-break:break-all;">${link}</span></p>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #f0f0f3;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#b3b3ba;">© 2026 Byparsathy. All rights reserved.<br>If you didn't create an account, you can safely ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(email, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;
  await deliver({
    to: email,
    subject: "Verify your email — Byparsathy",
    text: `Verify your email: ${link}`,
    html: verifyHtml(link),
  });
}

export async function sendPasswordResetEmail(email, code) {
  const link = `${config.frontendUrl}/reset-password?token=${code}`;
  await deliver({ to: email, subject: "Reset your Byparsathy password", text: `Reset your password: ${link}` });
}

export async function sendOtpEmail(email, code) {
  await deliver({
    to: email,
    subject: "Your Byparsathy security code",
    text: `Your one-time code is: ${code}\nIt expires in 10 minutes.`,
    html: otpHtml(code),
  });
}
