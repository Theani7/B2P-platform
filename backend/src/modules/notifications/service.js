import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";

function actorRead(user) {
  if (!user) return null;
  const avatar =
    user.promoterProfile?.avatarUrl || user.businessProfile?.logoUrl || null;
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    avatarUrl: avatar,
  };
}

function toNotificationRead(n) {
  return {
    id: n.id,
    recipientId: n.recipientId,
    actor: n.actor ? actorRead(n.actor) : null,
    type: n.type,
    title: n.title,
    message: n.message,
    entityType: n.entityType,
    entityId: n.entityId,
    isRead: n.isRead,
    readAt: n.readAt,
    createdAt: n.createdAt,
  };
}

export async function listNotifications(user, params = {}) {
  const { page = 1, limit = 50, unread_only = false } = params;
  const where = { recipientId: user.id };
  if (unread_only) where.isRead = false;

  const [rows, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: { actor: { include: { promoterProfile: true, businessProfile: true } } },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.notification.count({ where }),
  ]);
  return [rows.map(toNotificationRead), total];
}

export async function unreadCount(user) {
  return prisma.notification.count({
    where: { recipientId: user.id, isRead: false },
  });
}

export async function markRead(user, notificationId) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification || notification.recipientId !== user.id) return null;

  if (!notification.isRead) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }
  return notification;
}

export async function markAllRead(user) {
  const updated = await prisma.notification.updateMany({
    where: { recipientId: user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return updated.count;
}

export async function removeNotification(user, notificationId) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification || notification.recipientId !== user.id) return false;

  await prisma.notification.delete({ where: { id: notificationId } });
  return true;
}

export async function getPreferences(user) {
  const rows = await prisma.notificationPreference.findMany({
    where: { userId: user.id },
    orderBy: { type: "asc" },
  });
  return rows.map((p) => ({ id: p.id, type: p.type, enabled: p.enabled }));
}

export async function updatePreferences(user, items) {
  for (const item of items) {
    const existing = await prisma.notificationPreference.findFirst({
      where: { userId: user.id, type: item.type },
    });
    if (existing) {
      await prisma.notificationPreference.update({
        where: { id: existing.id },
        data: { enabled: item.enabled },
      });
    } else {
      await prisma.notificationPreference.create({
        data: { userId: user.id, type: item.type, enabled: item.enabled },
      });
    }
  }
  return getPreferences(user);
}
