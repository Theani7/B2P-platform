import dotenv from "dotenv";
dotenv.config();

const DEFAULT_SECRET = "INSECURE-CHANGE-ME-IN-PRODUCTION-V1";
const secretKey = process.env.SECRET_KEY || DEFAULT_SECRET;

if (process.env.NODE_ENV === "production" && secretKey === DEFAULT_SECRET) {
  throw new Error(
    "SECRET_KEY must be set to a strong, non-default value in production. Refusing to start."
  );
}

export const config = {
  projectName: process.env.PROJECT_NAME || "Byparsathy",
  apiV1: process.env.API_V1_STR || "/api/v1",
  secretKey,
  accessTokenExpireMinutes: Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || 30),
  refreshTokenExpireDays: Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS || 7),
  jwtAudience: process.env.JWT_AUDIENCE || "api.b2p.com",
  jwtIssuer: process.env.JWT_ISSUER || "auth.b2p.com",
  rateLimitAuth: Number(process.env.RATE_LIMIT_AUTH || 30),
  maxFailedLoginAttempts: Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS || 5),
  lockMinutes: Number(process.env.LOCK_MINUTES || 15),
  frontendUrl: (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, ""),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  port: Number(process.env.PORT || 8000),
};
