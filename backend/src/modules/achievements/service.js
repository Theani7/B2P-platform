import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { evaluateAll } from "./rules.js";
import { record as recordActivity } from "../activity/service.js";
import { createNotification } from "../../shared/notify.js";

export async function getAllAchievements(activeOnly = true) {
  return prisma.achievement.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { id: "asc" },
  });
}

function calculateLevelInfo(userAchievements) {
  const totalPoints = userAchievements
    .filter((ua) => ua.earnedAt)
    .reduce((sum, ua) => sum + (ua.achievement?.points ?? 0), 0);

  // Level curve: L1 needs 100, then each level adds level*100.
  let level = 1;
  let pointsNeeded = 100;
  let currentLevelBase = 0;
  while (totalPoints >= pointsNeeded) {
    level += 1;
    currentLevelBase = pointsNeeded;
    pointsNeeded += level * 100;
  }

  const currentLevelPoints = totalPoints - currentLevelBase;
  const nextLevelPointsNeeded = pointsNeeded - currentLevelBase;
  const progressPercentage = Math.min(
    100,
    Math.max(0, (currentLevelPoints / nextLevelPointsNeeded) * 100)
  );

  return {
    level,
    totalPoints,
    currentLevelPoints,
    nextLevelPoints: nextLevelPointsNeeded,
    progressPercentage,
  };
}

function toUserAchievementRead(ua) {
  return {
    id: ua.id,
    userId: ua.userId,
    achievementId: ua.achievementId,
    earnedAt: ua.earnedAt ?? null,
    progress: ua.progress,
    metadata: ua.metadata ?? null,
    achievement: ua.achievement,
  };
}

export async function getUserAchievementsWithLevel(userId) {
  const [userAchs, allAchs] = await Promise.all([
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    }),
    getAllAchievements(true),
  ]);

  const userAchMap = new Map(userAchs.map((ua) => [ua.achievementId, ua]));
  const fullList = allAchs.map((ach) => {
    if (userAchMap.has(ach.id)) return userAchMap.get(ach.id);
    return {
      id: null,
      userId,
      achievementId: ach.id,
      achievement: ach,
      earnedAt: null,
      progress: 0,
      metadata: null,
    };
  });

  const levelInfo = calculateLevelInfo(userAchs);
  return {
    achievements: fullList.map(toUserAchievementRead),
    levelInfo,
  };
}

export async function recalculateUserAchievements(user) {
  const evaluations = await evaluateAll(user);
  const results = [];

  for (const { key, progress } of evaluations) {
    const achievement = await prisma.achievement.findUnique({ where: { key } });
    if (!achievement) continue;

    let userAch = await prisma.userAchievement.findFirst({
      where: { userId: user.id, achievementId: achievement.id },
    });
    if (!userAch) {
      userAch = await prisma.userAchievement.create({
        data: { userId: user.id, achievementId: achievement.id, progress: 0 },
      });
    }

    if (!userAch.earnedAt && progress >= 100) {
      userAch = await prisma.userAchievement.update({
        where: { id: userAch.id },
        data: { progress: 100, earnedAt: new Date() },
      });

      await recordActivity({
        action: "ACHIEVEMENT_UNLOCKED",
        title: `Unlocked Badge: ${achievement.title}`,
        actorId: user.id,
        actorRole: user.role ?? "USER",
        entityType: "achievement",
        entityId: achievement.id,
      });

      await createNotification({
        recipientId: user.id,
        type: "SYSTEM",
        title: "Achievement Unlocked!",
        message: `You have unlocked the ${achievement.title} badge.`,
        entityType: "achievement",
        entityId: null,
      });
    } else if (!userAch.earnedAt && progress > userAch.progress) {
      userAch = await prisma.userAchievement.update({
        where: { id: userAch.id },
        data: { progress },
      });
    }

    results.push(userAch);
  }

  return results;
}

export async function recalculateAll() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: { promoterProfile: true, businessProfile: true },
  });
  let count = 0;
  for (const u of users) {
    await recalculateUserAchievements(u);
    count += 1;
  }
  return count;
}
