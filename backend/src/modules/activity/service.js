import { prisma } from "../../config/db.js";

/**
 * Record an activity log entry. Never throws — activity logging must not block
 * the primary operation.
 */
export async function record({
  action,
  title,
  actorId = null,
  actorRole = null,
  entityType = null,
  entityId = null,
  description = null,
  metadataInfo = null,
}) {
  try {
    return await prisma.activityLog.create({
      data: {
        action,
        title,
        actorId,
        actorRole,
        entityType,
        entityId: entityId != null ? String(entityId) : null,
        description,
        metadataInfo,
      },
    });
  } catch (e) {
    console.error("activity record failed", e?.message || e);
    return null;
  }
}

function toResponse(log) {
  return {
    id: log.id,
    actorId: log.actorId,
    actorRole: log.actorRole,
    entityType: log.entityType,
    entityId: log.entityId,
    action: log.action,
    title: log.title,
    description: log.description,
    metadataInfo: log.metadataInfo,
    createdAt: log.createdAt,
    actorName: log.actor?.fullName ?? null,
    actorAvatar: null,
  };
}

async function paginate(where, page, size) {
  const [rows, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      select: {
        id: true,
        actorId: true,
        actorRole: true,
        entityType: true,
        entityId: true,
        action: true,
        title: true,
        description: true,
        metadataInfo: true,
        createdAt: true,
        actor: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(size),
      take: Number(size),
    }),
    prisma.activityLog.count({ where }),
  ]);
  return [rows.map(toResponse), total];
}

export async function getMyActivities(user, page = 1, size = 20) {
  return paginate({ actorId: user.id }, page, size);
}

export async function getBusinessActivities(user, page = 1, size = 20) {
  return paginate({ actorId: user.id }, page, size);
}

export async function getAdminActivities(page = 1, size = 20) {
  return paginate(undefined, page, size);
}
