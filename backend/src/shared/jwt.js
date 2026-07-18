import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export function signAccessToken(userId, role) {
  const payload = { sub: String(userId), role, type: "access" };
  const options = {
    expiresIn: `${config.accessTokenExpireMinutes}m`,
    audience: config.jwtAudience,
    issuer: config.jwtIssuer,
  };
  return jwt.sign(payload, config.secretKey, options);
}

export function signRefreshToken(userId) {
  const payload = { sub: String(userId), type: "refresh" };
  const options = {
    expiresIn: `${config.refreshTokenExpireDays}d`,
    audience: config.jwtAudience,
    issuer: config.jwtIssuer,
  };
  return jwt.sign(payload, config.secretKey, options);
}

export function verifyToken(token) {
  return jwt.verify(token, config.secretKey, {
    audience: config.jwtAudience,
    issuer: config.jwtIssuer,
  });
}
