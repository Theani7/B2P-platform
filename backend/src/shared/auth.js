import { verifyToken } from "./jwt.js";
import { prisma } from "../config/db.js";
import { AppError } from "./errors.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) throw new AppError("Invalid token", 401);

    const payload = verifyToken(token);
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
