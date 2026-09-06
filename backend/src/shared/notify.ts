import { prisma } from "../config/db.js";
import { emitToUser } from "./socket.js";

/**
 * Create a notification. Never throws — notification failures must not block
 * the primary operation. Sprint 7 adds list/read endpoints + realtime push.
 */
export async function createNotification({
  recipientId,
  actorId = null,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
}) {
  try {
    const created = await prisma.notification.create({
      data: { recipientId, actorId, type, title, message, entityType, entityId },
    });
    emitToUser(recipientId, "NEW_NOTIFICATION", {
      id: created.id,
      type: created.type,
      title: created.title,
      message: created.message,
      entityType: created.entityType,
      entityId: created.entityId,
      isRead: created.isRead,
      createdAt: created.createdAt,
    });
    return created;
  } catch (e) {
    console.error("notification create failed", e?.message || e);
    return null;
  }
}
