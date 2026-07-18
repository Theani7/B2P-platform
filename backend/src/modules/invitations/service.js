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

// --- Business ---

export async function invite(user, campaignId, promoterId, payload) {
  const business = await businessProfileOf(user);
  const campaign = await campaignForBusiness(campaignId, business.id);

  const promoter = await prisma.promoterProfile.findUnique({ where: { id: promoterId } });
  if (!promoter) throw new AppError("Promoter not found", 404);

  const existing = await prisma.campaignInvitation.findUnique({
    where: { campaignId_promoterProfileId: { campaignId, promoterProfileId: promoterId } },
  });
  if (existing) throw new AppError("Invitation already sent to this promoter", 409);

  const invitation = await prisma.campaignInvitation.create({
    data: { campaignId, promoterProfileId: promoterId, message: payload.message ?? null },
  });

  await createNotification({
    recipientId: promoter.userId,
    actorId: user.id,
    type: "INVITATION_RECEIVED",
    title: "New campaign invitation",
    message: `You have been invited to promote '${campaign.title}'`,
    entityType: "campaign_invitation",
    entityId: invitation.id,
  });

  return invitation;
}

export async function cancel(user, invitationId) {
  const business = await businessProfileOf(user);
  const invitation = await prisma.campaignInvitation.findUnique({ where: { id: invitationId } });
  if (!invitation) throw new AppError("Invitation not found", 404);
  await campaignForBusiness(invitation.campaignId, business.id);
  if (invitation.status !== "PENDING") throw new AppError("Can only cancel pending invitations", 400);
  await prisma.campaignInvitation.delete({ where: { id: invitation.id } });
  return { success: true, message: "Invitation cancelled" };
}

export async function getBusinessInvitations(user, { status, page = 1, limit = 20 }) {
  const business = await businessProfileOf(user);
  const where = { campaign: { businessProfileId: business.id } };
  if (status) where.status = status;
  const total = await prisma.campaignInvitation.count({ where });
  const items = await prisma.campaignInvitation.findMany({
    where,
    include: { campaign: true, promoterProfile: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return [items, total];
}

// --- Promoter ---

export async function getPromoterInvitations(user, { status, page = 1, limit = 20 }) {
  const promoter = await promoterProfileOf(user);
  const where = { promoterProfileId: promoter.id };
  if (status) where.status = status;
  const total = await prisma.campaignInvitation.count({ where });
  const items = await prisma.campaignInvitation.findMany({
    where,
    include: { campaign: { include: { businessProfile: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return [items, total];
}

export async function accept(user, invitationId) {
  const promoter = await promoterProfileOf(user);
  const invitation = await prisma.campaignInvitation.findFirst({
    where: { id: invitationId, promoterProfileId: promoter.id },
    include: { campaign: { include: { businessProfile: true } } },
  });
  if (!invitation) throw new AppError("Invitation not found", 404);
  if (invitation.status !== "PENDING") throw new AppError("Invitation is not pending", 400);

  const campaign = invitation.campaign;
  const business = campaign.businessProfile;

  const collab = await prisma.$transaction(async (tx) => {
    await tx.campaignInvitation.update({ where: { id: invitation.id }, data: { status: "ACCEPTED" } });
    return tx.collaboration.create({
      data: {
        campaignId: campaign.id,
        businessProfileId: business.id,
        promoterProfileId: promoter.id,
        invitationId: invitation.id,
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });
  });

  await createNotification({
    recipientId: business.userId,
    actorId: user.id,
    type: "INVITATION_ACCEPTED",
    title: "Invitation accepted",
    message: `${user.username} accepted your invitation to promote '${campaign.title}'`,
    entityType: "campaign_invitation",
    entityId: invitation.id,
  });
  await createNotification({
    recipientId: user.id,
    actorId: business.userId,
    type: "COLLABORATION_STARTED",
    title: "Collaboration started",
    message: `You are now collaborating with ${business.companyName} on '${campaign.title}'`,
    entityType: "collaboration",
    entityId: collab.id,
  });

  return collab;
}

export async function reject(user, invitationId) {
  const promoter = await promoterProfileOf(user);
  const invitation = await prisma.campaignInvitation.findFirst({
    where: { id: invitationId, promoterProfileId: promoter.id },
    include: { campaign: { include: { businessProfile: true } } },
  });
  if (!invitation) throw new AppError("Invitation not found", 404);
  if (invitation.status !== "PENDING") throw new AppError("Invitation is not pending", 400);

  await prisma.campaignInvitation.update({ where: { id: invitation.id }, data: { status: "REJECTED" } });

  await createNotification({
    recipientId: invitation.campaign.businessProfile.userId,
    actorId: user.id,
    type: "INVITATION_DECLINED",
    title: "Invitation declined",
    message: `${user.username} declined your invitation to promote '${invitation.campaign.title}'`,
    entityType: "campaign_invitation",
    entityId: invitation.id,
  });

  return { success: true, message: "Invitation rejected" };
}
