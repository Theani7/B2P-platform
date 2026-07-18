import nodemailer from "nodemailer";
import { config } from "../config/env.js";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USERNAME) {
    // Dev mode: don't send, just log the link.
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

const from = process.env.EMAIL_FROM || "Byparsathy <noreply@byparsathy.com>";

export async function sendVerificationEmail(email, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;
  const t = getTransporter();
  if (!t) {
    console.log(`[email:verify] ${email} -> ${link}`);
    return;
  }
  await t.sendMail({ from, to: email, subject: "Verify your Byparsathy account", text: `Verify your email: ${link}` });
}

export async function sendPasswordResetEmail(email, code) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email:reset] ${email} -> code ${code}`);
    return;
  }
  await t.sendMail({
    from,
    to: email,
    subject: "Reset your Byparsathy password",
    text: `Your password reset code is: ${code}`,
  });
}
