import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { createNotification } from "../../shared/notify.js";

const userCard = { id: true, username: true, fullName: true, role: true };

async function ensureTarget(userId) {
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new AppError("User not found", 404);
  return target;
}

async function targetCounts(targetId) {
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: targetId } }),
    prisma.follow.count({ where: { followerId: targetId } }),
  ]);
  return { followersCount, followingCount };
}

export async function follow(user, targetId) {
  if (user.id === targetId) throw new AppError("You cannot follow yourself", 400);
  await ensureTarget(targetId);

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: targetId } },
  });
  const counts = await targetCounts(targetId);
  if (existing) return { following: true, ...counts };

  await prisma.follow.create({ data: { followerId: user.id, followingId: targetId } });
  const fresh = await targetCounts(targetId);

  await createNotification({
    recipientId: targetId,
    actorId: user.id,
    type: "SYSTEM",
    title: "New follower",
    message: `${user.username} started following you`,
    entityType: "user",
    entityId: user.id,
  });

  return { following: true, ...fresh };
}

export async function unfollow(user, targetId) {
  await ensureTarget(targetId);
  await prisma.follow.deleteMany({
    where: { followerId: user.id, followingId: targetId },
  });
  const counts = await targetCounts(targetId);
  return { following: false, ...counts };
}

export async function status(user, targetId) {
  await ensureTarget(targetId);
  const [rel, counts] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: targetId } },
    }),
    targetCounts(targetId),
  ]);
  return { isFollowing: !!rel, ...counts };
}

export async function listFollowers(targetId, { page = 1, limit = 20 } = {}) {
  await ensureTarget(targetId);
  const where = { followingId: targetId };
  const [rows, total] = await Promise.all([
    prisma.follow.findMany({
      where,
      include: { follower: { select: userCard } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.follow.count({ where }),
  ]);
  return [rows.map((r) => r.follower), total];
}

export async function listFollowing(targetId, { page = 1, limit = 20 } = {}) {
  await ensureTarget(targetId);
  const where = { followerId: targetId };
  const [rows, total] = await Promise.all([
    prisma.follow.findMany({
      where,
      include: { following: { select: userCard } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.follow.count({ where }),
  ]);
  return [rows.map((r) => r.following), total];
}
