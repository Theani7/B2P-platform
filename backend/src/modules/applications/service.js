import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";
import { createNotification } from "../../shared/notify.js";

async function promoterProfileOf(user) {
  if (user.role !== ROLE.PROMOTER) {
    throw new AppError("Only PROMOTER users can perform this action", 403);
  }
  const profile = await prisma.promoterProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Promoter profile not found", 404);
  return profile;
}

async function businessProfileOf(user) {
  if (user.role !== ROLE.BUSINESS) {
    throw new AppError("Only BUSINESS users can perform this action", 403);
  }
  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Business profile not found", 404);
  return profile;
}

async function campaignForBusiness(campaignId, businessProfileId) {
  const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, businessProfileId } });
  if (!campaign) throw new AppError("Campaign not found", 404);
  return campaign;
}

// --- Promoter ---

export async function apply(user, campaignId, payload) {
  const promoter = await promoterProfileOf(user);

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { businessProfile: true },
  });
  if (!campaign) throw new AppError("Campaign not found", 404);
  if (campaign.status !== "OPEN") throw new AppError("Campaign is not open for applications", 400);
  if (campaign.visibility !== "PUBLIC") throw new AppError("Campaign is not accepting applications", 400);

  const existing = await prisma.campaignApplication.findUnique({
    where: { campaignId_promoterProfileId: { campaignId, promoterProfileId: promoter.id } },
  });

  let application;
  if (existing) {
    if (existing.status !== "WITHDRAWN") {
      throw new AppError("You have already applied to this campaign", 409);
    }
    application = await prisma.campaignApplication.update({
      where: { id: existing.id },
      data: { status: "PENDING", message: payload.message ?? null },
    });
  } else {
    application = await prisma.campaignApplication.create({
      data: { campaignId, promoterProfileId: promoter.id, message: payload.message ?? null },
    });
  }

  await createNotification({
    recipientId: campaign.businessProfile.userId,
    actorId: user.id,
    type: "APPLICATION_RECEIVED",
    title: "New application received",
    message: `${user.username} applied to your campaign '${campaign.title}'`,
    entityType: "campaign_application",
    entityId: application.id,
  });

  return application;
}

export async function withdraw(user, applicationId) {
  const promoter = await promoterProfileOf(user);
  const application = await prisma.campaignApplication.findFirst({
    where: { id: applicationId, promoterProfileId: promoter.id },
  });
  if (!application) throw new AppError("Application not found", 404);
  if (application.status !== "PENDING") throw new AppError("Can only withdraw pending applications", 400);
  await prisma.campaignApplication.update({ where: { id: application.id }, data: { status: "WITHDRAWN" } });
  return { success: true, message: "Application withdrawn" };
}

export async function getPromoterApplications(user, { page = 1, limit = 20 }) {
  const promoter = await promoterProfileOf(user);
  const where = { promoterProfileId: promoter.id };
  const total = await prisma.campaignApplication.count({ where });
  const items = await prisma.campaignApplication.findMany({
    where,
    include: { campaign: { include: { businessProfile: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return [items, total];
}

// --- Business ---

export async function getCampaignApplications(user, campaignId, { page = 1, limit = 20 }) {
  const business = await businessProfileOf(user);
  const campaign = await campaignForBusiness(campaignId, business.id);
  const where = { campaignId: campaign.id };
  const total = await prisma.campaignApplication.count({ where });
  const items = await prisma.campaignApplication.findMany({
    where,
    include: { promoterProfile: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return [items, total];
}

export async function getBusinessApplications(user, { page = 1, limit = 20 }) {
  const business = await businessProfileOf(user);
  const where = { campaign: { businessProfileId: business.id } };
  const total = await prisma.campaignApplication.count({ where });
  const items = await prisma.campaignApplication.findMany({
    where,
    include: { promoterProfile: true, campaign: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return [items, total];
}

export async function accept(user, applicationId) {
  const business = await businessProfileOf(user);
  const application = await prisma.campaignApplication.findUnique({
    where: { id: applicationId },
    include: { promoterProfile: true },
  });
  if (!application) throw new AppError("Application not found", 404);
  if (application.status !== "PENDING") throw new AppError("Application is not pending", 400);

  const campaign = await campaignForBusiness(application.campaignId, business.id);

  const collab = await prisma.$transaction(async (tx) => {
    await tx.campaignApplication.update({ where: { id: application.id }, data: { status: "ACCEPTED" } });
    return tx.collaboration.create({
      data: {
        campaignId: campaign.id,
        businessProfileId: business.id,
        promoterProfileId: application.promoterProfileId,
        applicationId: application.id,
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });
  });

  await createNotification({
    recipientId: application.promoterProfile.userId,
    actorId: business.userId,
    type: "APPLICATION_ACCEPTED",
    title: "Application accepted",
    message: `Your application for '${campaign.title}' has been accepted!`,
    entityType: "collaboration",
    entityId: collab.id,
  });

  return collab;
}

export async function reject(user, applicationId) {
  const business = await businessProfileOf(user);
  const application = await prisma.campaignApplication.findUnique({
    where: { id: applicationId },
    include: { promoterProfile: true },
  });
  if (!application) throw new AppError("Application not found", 404);
  if (application.status !== "PENDING") throw new AppError("Application is not pending", 400);

  const campaign = await campaignForBusiness(application.campaignId, business.id);

  await prisma.campaignApplication.update({ where: { id: application.id }, data: { status: "REJECTED" } });

  await createNotification({
    recipientId: application.promoterProfile.userId,
    actorId: business.userId,
    type: "APPLICATION_REJECTED",
    title: "Application rejected",
    message: `Your application for '${campaign.title}' has been rejected.`,
    entityType: "campaign_application",
    entityId: application.id,
  });

  return { success: true, message: "Application rejected" };
}
