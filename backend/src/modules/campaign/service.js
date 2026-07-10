import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";

// Allowed forward status transitions (ARCHIVED/CANCELLED allowed from anywhere).
const VALID_TRANSITIONS = {
  DRAFT: new Set(["OPEN"]),
  OPEN: new Set(["ACTIVE"]),
  ACTIVE: new Set(["COMPLETED"]),
};

function validateTransition(current, next) {
  if (next === "ARCHIVED" || next === "CANCELLED") return;
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed || !allowed.has(next)) {
    throw new AppError(`Invalid status transition from ${current} to ${next}`, 400);
  }
}

async function businessProfileOf(user) {
  if (user.role !== ROLE.BUSINESS) {
    throw new AppError("Only BUSINESS users can manage campaigns", 403);
  }
  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Business profile not found. Create a business profile first.", 404);
  return profile;
}

async function campaignForBusiness(campaignId, businessProfileId) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, businessProfileId },
  });
  if (!campaign) throw new AppError("Campaign not found", 404);
  return campaign;
}

export async function create(user, payload) {
  const profile = await businessProfileOf(user);
  return prisma.campaign.create({
    data: { businessProfileId: profile.id, ...payload },
  });
}

export async function get(user, campaignId) {
  const profile = await businessProfileOf(user);
  return campaignForBusiness(campaignId, profile.id);
}

export async function list(user, params = {}) {
  const profile = await businessProfileOf(user);
  const { search, status, location, page = 1, limit = 10, sort = "createdAt" } = params;

  const where = { businessProfileId: profile.id };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (location) where.location = { contains: location, mode: "insensitive" };

  const total = await prisma.campaign.count({ where });
  const items = await prisma.campaign.findMany({
    where,
    orderBy: { [sort]: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return [items, total];
}

export async function update(user, campaignId, payload) {
  const profile = await businessProfileOf(user);
  const campaign = await campaignForBusiness(campaignId, profile.id);

  if (payload.status && payload.status !== campaign.status) {
    validateTransition(campaign.status, payload.status);
  }
  return prisma.campaign.update({ where: { id: campaign.id }, data: payload });
}

export async function remove(user, campaignId) {
  const profile = await businessProfileOf(user);
  const campaign = await campaignForBusiness(campaignId, profile.id);

  // Cascade-delete dependents that lack DB-level cascade.
  await prisma.$transaction(async (tx) => {
    const collabs = await tx.collaboration.findMany({
      where: { campaignId: campaign.id },
      select: { id: true },
    });
    const collabIds = collabs.map((c) => c.id);
    if (collabIds.length) {
      await tx.review.deleteMany({ where: { collaborationId: { in: collabIds } } });
      const convs = await tx.conversation.findMany({
        where: { campaignId: { in: collabIds } },
        select: { id: true },
      });
      const convIds = convs.map((c) => c.id);
      if (convIds.length) {
        await tx.message.deleteMany({ where: { conversationId: { in: convIds } } });
        await tx.conversation.deleteMany({ where: { id: { in: convIds } } });
      }
      await tx.deliverable.deleteMany({ where: { collaborationId: { in: collabIds } } });
      await tx.collaboration.deleteMany({ where: { campaignId: campaign.id } });
    }
    await tx.campaignApplication.deleteMany({ where: { campaignId: campaign.id } });
    await tx.campaignInvitation.deleteMany({ where: { campaignId: campaign.id } });
    await tx.matchResult.deleteMany({ where: { campaignId: campaign.id } });
    await tx.savedCampaign.deleteMany({ where: { campaignId: campaign.id } });
    await tx.campaign.delete({ where: { id: campaign.id } });
  });

  return { success: true, message: "Campaign deleted" };
}

export async function publish(user, campaignId) {
  const profile = await businessProfileOf(user);
  const campaign = await campaignForBusiness(campaignId, profile.id);
  if (campaign.status !== "DRAFT") {
    throw new AppError(`Only DRAFT campaigns can be published (current status: ${campaign.status})`, 400);
  }
  return prisma.campaign.update({ where: { id: campaign.id }, data: { status: "OPEN" } });
}

export async function unpublish(user, campaignId) {
  const profile = await businessProfileOf(user);
  const campaign = await campaignForBusiness(campaignId, profile.id);
  if (campaign.status !== "OPEN") {
    throw new AppError(`Only OPEN campaigns can be unpublished (current status: ${campaign.status})`, 400);
  }
  return prisma.campaign.update({ where: { id: campaign.id }, data: { status: "DRAFT" } });
}

export async function archive(user, campaignId) {
  return update(user, campaignId, { status: "ARCHIVED" });
}

export async function reopen(user, campaignId) {
  const profile = await businessProfileOf(user);
  const campaign = await campaignForBusiness(campaignId, profile.id);
  if (campaign.status !== "ARCHIVED") {
    throw new AppError("Only archived campaigns can be reopened", 400);
  }
  return prisma.campaign.update({ where: { id: campaign.id }, data: { status: "DRAFT" } });
}

export async function dashboardStats(user) {
  const profile = await businessProfileOf(user);
  const base = { businessProfileId: profile.id };

  const [total, open, active, completed, draft, recent] = await Promise.all([
    prisma.campaign.count({ where: base }),
    prisma.campaign.count({ where: { ...base, status: "OPEN" } }),
    prisma.campaign.count({ where: { ...base, status: "ACTIVE" } }),
    prisma.campaign.count({ where: { ...base, status: "COMPLETED" } }),
    prisma.campaign.count({ where: { ...base, status: "DRAFT" } }),
    prisma.campaign.findMany({ where: base, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return {
    total_campaigns: total,
    open_campaigns: open,
    active_campaigns: active,
    completed_campaigns: completed,
    draft_campaigns: draft,
    recent_campaigns: recent.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      budget: c.budget,
      created_at: c.createdAt,
    })),
  };
}
