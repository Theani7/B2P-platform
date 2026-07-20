import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../config/db.js";
import { signAccessToken, signRefreshToken, verifyToken } from "../../shared/jwt.js";
import { AppError } from "../../shared/errors.js";
import { config } from "../../config/env.js";
import { sendVerificationEmail, sendPasswordResetEmail, sendOtpEmail } from "../../utils/email.js";

function tokens(user) {
  return {
    access_token: signAccessToken(String(user.id), user.role),
    refresh_token: signRefreshToken(String(user.id)),
    token_type: "bearer",
  };
}

export async function register(payload) {
  const existingEmail = await prisma.user.findUnique({ where: { email: payload.email } });
  const existingEmailPending = await prisma.pendingRegistration.findUnique({ where: { email: payload.email } });
  if (existingEmail || existingEmailPending) throw new AppError("Email already registered", 409);

  const existingUsername = await prisma.user.findUnique({ where: { username: payload.username } });
  const existingUsernamePending = await prisma.pendingRegistration.findUnique({ where: { username: payload.username } });
  if (existingUsername || existingUsernamePending) throw new AppError("Username already taken", 409);

  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  const passwordHash = await bcrypt.hash(payload.password, 10);

  // Defer account creation until the email OTP is verified — store pending only.
  await prisma.pendingRegistration.upsert({
    where: { email: payload.email },
    update: { username: payload.username, fullName: payload.fullName, passwordHash, role: payload.role, otpCode, otpExpiry },
    create: {
      username: payload.username,
      fullName: payload.fullName,
      email: payload.email,
      passwordHash,
      role: payload.role,
      otpCode,
      otpExpiry,
    },
  });

  try {
    await sendOtpEmail(payload.email, otpCode);
  } catch (e) {
    console.error("registration otp email failed", e);
  }

  return { email: payload.email, role: payload.role };
}

export async function resendRegistrationOtp(email) {
  const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
  if (!pending) return;
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.pendingRegistration.update({ where: { email }, data: { otpCode, otpExpiry } });
  try {
    await sendOtpEmail(email, otpCode);
  } catch (e) {
    console.error("registration otp email failed", e);
  }
}

export async function checkAvailability(query) {
  const result = { usernameAvailable: true, emailAvailable: true };
  if (query.username) {
    const user = await prisma.user.findUnique({ where: { username: query.username } });
    const pending = await prisma.pendingRegistration.findUnique({ where: { username: query.username } });
    if (user || pending) result.usernameAvailable = false;
  }
  if (query.email) {
    const user = await prisma.user.findUnique({ where: { email: query.email } });
    const pending = await prisma.pendingRegistration.findUnique({ where: { email: query.email } });
    if (user || pending) result.emailAvailable = false;
  }
  return result;
}

export async function login(payload) {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) throw new AppError("Invalid credentials", 401);

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    throw new AppError("Account temporarily locked due to failed attempts", 403);
  }

  const valid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!valid) {
    await incrementFailed(user.id);
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) throw new AppError("User is deactivated", 403);
  if (!user.isVerified) throw new AppError("Please verify your email before signing in", 403);

  await resetFailed(user.id);
  return tokens(user);
}

async function incrementFailed(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const attempts = (user.failedLoginAttempts || 0) + 1;
  const data = { failedLoginAttempts: attempts };
  if (attempts >= config.maxFailedLoginAttempts) {
    data.lockedUntil = new Date(Date.now() + config.lockMinutes * 60 * 1000);
  }
  await prisma.user.update({ where: { id: userId }, data });
}

async function resetFailed(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
}

export async function refresh(refreshToken) {
  const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const revoked = await prisma.revokedRefreshToken.findUnique({ where: { tokenHash: hash } });
  if (revoked) throw new AppError("Refresh token revoked", 401);

  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch (e) {
    throw new AppError("Invalid refresh token", 401);
  }
  if (payload.type !== "refresh") throw new AppError("Invalid token type", 401);

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw new AppError("User not found", 401);

  // Rotate: revoke old, issue new.
  await prisma.revokedRefreshToken.create({
    data: {
      tokenHash: hash,
      expiresAt: new Date(Date.now() + config.refreshTokenExpireDays * 24 * 60 * 60 * 1000),
    },
  });

  return tokens(user);
}

export async function verifyEmail(token) {
  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user) throw new AppError("Invalid token", 404);
  if (user.isVerified) return;
  if (user.verificationTokenExpiry && new Date(user.verificationTokenExpiry) < new Date()) {
    throw new AppError("Verification token expired", 400);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationToken: null, verificationTokenExpiry: null },
  });
}

export async function resendVerification(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isVerified) return;
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken, verificationTokenExpiry },
  });
  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch (e) {
    console.error("verification email failed", e);
  }
}

export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const resetCode = crypto.randomInt(100000, 1000000).toString();
  const resetCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.user.update({ where: { id: user.id }, data: { resetCode, resetCodeExpiry } });
  try {
    await sendOtpEmail(user.email, resetCode);
  } catch (e) {
    console.error("reset email failed", e);
  }
}

export async function verifyResetCode(email, code) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.resetCode || user.resetCode !== code) throw new AppError("Invalid code", 401);
  if (user.resetCodeExpiry && new Date(user.resetCodeExpiry) < new Date()) {
    throw new AppError("Reset code expired", 400);
  }
  // Short-lived token proving the code was verified, used by resetPassword.
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { resetVerifyToken: verifyToken, resetVerifyTokenExpiry: verifyTokenExpiry },
  });
  return verifyToken;
}

export async function resetPassword(token, newPassword) {
  const user = await prisma.user.findFirst({ where: { resetVerifyToken: token } });
  if (!user) throw new AppError("Invalid or unverified code", 401);
  if (user.resetVerifyTokenExpiry && new Date(user.resetVerifyTokenExpiry) < new Date()) {
    throw new AppError("Session expired, request a new code", 400);
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetCode: null,
      resetCodeExpiry: null,
      resetVerifyToken: null,
      resetVerifyTokenExpiry: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
}

export async function requestOtp(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid credentials", 401);
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    throw new AppError("Account temporarily locked due to failed attempts", 403);
  }
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.user.update({ where: { id: user.id }, data: { otpCode, otpExpiry } });
  try {
    await sendOtpEmail(user.email, otpCode);
  } catch (e) {
    console.error("otp email failed", e);
  }
}

export async function verifyOtp(email, code) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.otpCode || user.otpCode !== code) throw new AppError("Invalid code", 401);
  if (user.otpExpiry && new Date(user.otpExpiry) < new Date()) {
    throw new AppError("Code expired", 400);
  }
  if (!user.isActive) throw new AppError("User is deactivated", 403);
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: null, otpExpiry: null, lastLoginAt: new Date() },
  });
  return tokens(user);
}

export async function verifyRegistrationOtp(email, code) {
  const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
  if (!pending || !pending.otpCode || pending.otpCode !== code) throw new AppError("Invalid code", 401);
  if (pending.otpExpiry && new Date(pending.otpExpiry) < new Date()) {
    throw new AppError("Code expired", 400);
  }

  // Now create the real account (only on successful verification).
  const user = await prisma.user.create({
    data: {
      username: pending.username,
      fullName: pending.fullName,
      email: pending.email,
      passwordHash: pending.passwordHash,
      role: pending.role,
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.pendingRegistration.delete({ where: { email } });
  return tokens(user);
}

export async function updateMe(user, payload) {
  const data = {};
  if (payload.fullName !== undefined) data.fullName = payload.fullName;
  if (payload.email !== undefined) data.email = payload.email;
  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return updated;
}
