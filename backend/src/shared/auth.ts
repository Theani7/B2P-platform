import { verifyToken } from "./jwt.js";
import { prisma } from "../config/db.js";
import { AppError } from "./errors.js";

export async function authenticate(req, res, next) {
  try {
    if (req._authenticatedUser) {
      req.user = req._authenticatedUser;
      return next();
    }
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) throw new AppError("Invalid token", 401);

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      const expired = err?.name === "TokenExpiredError";
      throw new AppError(expired ? "Token expired" : "Invalid token", 401);
    }
    if (payload.type !== "access") throw new AppError("Invalid token", 401);
    const userId = payload.sub;
    if (!userId) throw new AppError("Invalid token", 401);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { promoterProfile: true, businessProfile: true },
    });

    if (!user || !user.isActive) throw new AppError("Inactive user", 401);
    if (!user.isVerified) throw new AppError("Please verify your email before continuing", 403);
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new AppError("Account locked", 403);
    }

    req._authenticatedUser = user;
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Unauthorized", 401));
    if (req.user.role !== role) {
      return next(new AppError("Operation not permitted for your role", 403));
    }
    next();
  };
}
