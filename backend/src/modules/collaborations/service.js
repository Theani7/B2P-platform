import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";

async function businessProfileOf(user) {
  if (user.role !== ROLE.BUSINESS) throw new AppError("Only BUSINESS users can perform this action", 403);
  const profile = user.businessProfile;
  if (!profile) throw new AppError("Business profile not found", 404);
  return profile;
}

async function promoterProfileOf(user) {
  if (user.role !== ROLE.PROMOTER) throw new AppError("Only PROMOTER users can perform this action", 403);
  const profile = user.promoterProfile;
  if (!profile) throw new AppError("Promoter profile not found", 404);
  return profile;
}

async function collaborationForBusiness(collaborationId, businessProfileId) {
  const collab = await prisma.collaboration.findFirst({
    where: { id: collaborationId, businessProfileId },
  });
  if (!collab) throw new AppError("Collaboration not found", 404);
  return collab;
}

async function collaborationForPromoter(collaborationId, promoterProfileId) {
  const collab = await prisma.collaboration.findFirst({
    where: { id: collaborationId, promoterProfileId },
  });
  if (!collab) throw new AppError("Collaboration not found", 404);
  return collab;
}

async function reviewedCollabIds(userId, collaborationIds) {
  if (!collaborationIds.length) return new Set();
  const rows = await prisma.review.findMany({
    where: { reviewerId: userId, collaborationId: { in: collaborationIds } },
    select: { collaborationId: true },
  });
  return new Set(rows.map((r) => r.collaborationId));
}

function toRead(collab, user) {
  const campaign = collab.campaign || {};
  const partner = collab.promoterProfile || {};
  const business = collab.businessProfile || {};
  const isBusiness = user.role === ROLE.BUSINESS;
  return {
    id: collab.id,
    campaignId: collab.campaignId,
    businessProfileId: collab.businessProfileId,
    promoterProfileId: collab.promoterProfileId,
    applicationId: collab.applicationId,
    invitationId: collab.invitationId,
    status: collab.status,
    startedAt: collab.startedAt,
    completedAt: collab.completedAt,
    createdAt: collab.createdAt,
    updatedAt: collab.updatedAt,
    campaignTitle: campaign.title ?? "",
    campaignCategory: campaign.category ?? "",
    campaignBudget: campaign.budget ?? 0,
    campaignStartDate: campaign.startDate ?? null,
    campaignEndDate: campaign.endDate ?? null,
    partnerName: isBusiness ? partner.username ?? "" : business.companyName ?? "",
    partnerUsername: isBusiness ? partner.username ?? "" : business.companyName ?? "",
    partnerAvatarUrl: isBusiness ? partner.avatarUrl ?? null : business.logoUrl ?? null,
    hasReview: collab._hasReview ?? false,
  };
}

export async function listBusinessCollaborations(user, params = {}) {
  const profile = await businessProfileOf(user);
  const { status, page = 1, limit = 20 } = params;
  const where = { businessProfileId: profile.id };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.collaboration.findMany({
      where,
      include: { campaign: true, promoterProfile: true },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.collaboration.count({ where }),
  ]);

  const reviewed = await reviewedCollabIds(user.id, items.map((c) => c.id));
  return [items.map((c) => toRead({ ...c, _hasReview: reviewed.has(c.id) }, user)), total];
}

export async function listPromoterCollaborations(user, params = {}) {
  const profile = await promoterProfileOf(user);
  const { status, page = 1, limit = 20 } = params;
  const where = { promoterProfileId: profile.id };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.collaboration.findMany({
      where,
      include: { campaign: true, businessProfile: true },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.collaboration.count({ where }),
  ]);

  const reviewed = await reviewedCollabIds(user.id, items.map((c) => c.id));
  return [items.map((c) => toRead({ ...c, _hasReview: reviewed.has(c.id) }, user)), total];
}

export async function getDeliverables(user, collaborationId) {
  let where;
  if (user.role === ROLE.BUSINESS) {
    const profile = await businessProfileOf(user);
    await collaborationForBusiness(collaborationId, profile.id);
    where = { collaborationId };
  } else {
    const profile = await promoterProfileOf(user);
    await collaborationForPromoter(collaborationId, profile.id);
    where = { collaborationId };
  }
  return prisma.deliverable.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function createDeliverable(user, collaborationId, payload) {
  const profile = await promoterProfileOf(user);
  await collaborationForPromoter(collaborationId, profile.id);
  return prisma.deliverable.create({
    data: {
      collaborationId,
      title: payload.title,
      description: payload.description ?? null,
      contentUrl: payload.contentUrl,
      status: "IN_REVIEW",
    },
  });
}

export async function reviewDeliverable(user, collaborationId, deliverableId, payload) {
  const profile = await businessProfileOf(user);
  await collaborationForBusiness(collaborationId, profile.id);
  const deliverable = await prisma.deliverable.findFirst({
    where: { id: deliverableId, collaborationId },
  });
  if (!deliverable) throw new AppError("Deliverable not found", 404);
  return prisma.deliverable.update({
    where: { id: deliverableId },
    data: { status: payload.status, feedback: payload.feedback ?? null },
  });
}
