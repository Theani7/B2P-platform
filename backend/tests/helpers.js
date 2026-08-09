import { prisma } from "../src/config/db.js";
import { signAccessToken, signRefreshToken } from "../src/shared/jwt.js";
import { ROLE } from "../src/shared/enums.js";

export async function createTestUser(overrides = {}) {
  const unique = Date.now() + Math.random().toString(36).slice(2, 8);
  const user = await prisma.user.create({
    data: {
      username: overrides.username || `testuser_${unique}`,
      fullName: overrides.fullName || "Test User",
      email: overrides.email || `test_${unique}@example.com`,
      passwordHash: overrides.passwordHash || "$2a$10$invalidhashfortesting",
      role: overrides.role || ROLE.PROMOTER,
      isActive: overrides.isActive ?? true,
      isVerified: overrides.isVerified ?? true,
    },
  });
  return user;
}

export function authHeaders(user) {
  const token = signAccessToken(user.id, user.role);
  return { Authorization: `Bearer ${token}` };
}

export function createTestToken(userId, role = ROLE.PROMOTER) {
  return signAccessToken(userId, role);
}

export async function cleanupTestUsers() {
  await prisma.user.deleteMany({
    where: { email: { contains: "_@example.com" } },
  });
}

export { signRefreshToken, prisma };
