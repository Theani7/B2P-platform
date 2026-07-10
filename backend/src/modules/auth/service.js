import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../config/db.js";
import { signAccessToken, signRefreshToken, verifyToken } from "../../shared/jwt.js";
import { AppError } from "../../shared/errors.js";
import { config } from "../../config/env.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../utils/email.js";

function tokens(user) {
  return {
    access_token: signAccessToken(String(user.id), user.role),
    refresh_token: signRefreshToken(String(user.id)),
    token_type: "bearer",
  };
}

export async function register(payload) {
  const existingEmail = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingEmail) throw new AppError("Email already registered", 409);

  const existingUsername = await prisma.user.findUnique({ where: { username: payload.username } });
  if (existingUsername) throw new AppError("Username already taken", 409);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const passwordHash = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      username: payload.username,
      fullName: payload.fullName,
      email: payload.email,
      passwordHash,
      role: payload.role,
      isActive: true,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    },
  });

  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch (e) {
    console.error("verification email failed", e);
  }

  return tokens(user);
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

export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const resetCode = crypto.randomBytes(32).toString("hex");
  const resetCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.user.update({ where: { id: user.id }, data: { resetCode, resetCodeExpiry } });
  try {
    await sendPasswordResetEmail(user.email, resetCode);
  } catch (e) {
    console.error("reset email failed", e);
  }
}

export async function resetPassword(token, newPassword) {
  const user = await prisma.user.findFirst({ where: { resetCode: token } });
  if (!user) throw new AppError("Invalid code", 404);
  if (user.resetCodeExpiry && new Date(user.resetCodeExpiry) < new Date()) {
    throw new AppError("Reset code expired", 400);
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetCode: null, resetCodeExpiry: null, failedLoginAttempts: 0, lockedUntil: null },
  });
}

export async function updateMe(user, payload) {
  const data = {};
  if (payload.fullName !== undefined) data.fullName = payload.fullName;
  if (payload.email !== undefined) data.email = payload.email;
  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return updated;
}
