import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";
import * as discovery from "../discovery/service.js";

function ensureBusiness(user) {
  if (user.role !== ROLE.BUSINESS) {
    throw new AppError("Only BUSINESS users can manage business profiles", 403);
  }
}

async function withPendingVerification(profile) {
  const pending = await prisma.verificationRequest.findFirst({
    where: { businessProfileId: profile.id, status: "PENDING" },
  });
  return { ...profile, hasPendingVerification: !!pending };
}

export async function createOrUpdate(user, payload) {
  ensureBusiness(user);
  let profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (profile) {
    await prisma.businessProfile.update({ where: { id: profile.id }, data: payload });
  } else {
    profile = await prisma.businessProfile.create({ data: { userId: user.id, ...payload } });
  }
  const reloaded = await prisma.businessProfile.findUnique({ where: { id: profile.id } });
  return withPendingVerification(reloaded);
}

export async function getMyProfile(user) {
  ensureBusiness(user);
  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Profile not found", 404);
  return withPendingVerification(profile);
}

export async function deleteProfile(user) {
  ensureBusiness(user);
  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (profile) {
    await prisma.businessProfile.delete({ where: { id: profile.id } });
  }
  return { success: true, message: "Profile deleted" };
}

export async function analytics(user) {
  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return {
      summary: {
        active_campaigns: 0, total_campaigns: 0, total_spent: 0,
        applications_received: 0, total_applications: 0,
        active_collaborations: 0, collaborations_completed: 0,
        average_roi: 0, profile_views: 0, average_rating: 0,
      },
      charts: {}, growth: {}, metadata: { period: "30d" },
    };
  }

  const totalCampaigns = await prisma.campaign.count({ where: { businessProfileId: profile.id } });
  const activeCampaigns = await prisma.campaign.count({ where: { businessProfileId: profile.id, status: "OPEN" } });
  const totalApplications = await prisma.campaignApplication.count({ where: { campaign: { businessProfileId: profile.id } } });
  const activeCollabs = await prisma.collaboration.count({ where: { businessProfileId: profile.id, status: "ACTIVE" } });
  const completedCollabs = await prisma.collaboration.count({ where: { businessProfileId: profile.id, status: "COMPLETED" } });

  const dist = await prisma.campaignApplication.groupBy({
    by: ["status"],
    where: { campaign: { businessProfileId: profile.id } },
    _count: { _all: true },
  });
  let distData = dist.map((d) => ({ name: d.status, value: d._count._all }));
  if (distData.length === 0) {
    distData = [
      { name: "PENDING", value: 0 },
      { name: "ACCEPTED", value: 0 },
      { name: "REJECTED", value: 0 },
    ];
  }

  return {
    summary: {
      active_campaigns: activeCampaigns,
      total_campaigns: totalCampaigns,
      total_spent: 0,
      applications_received: totalApplications,
      total_applications: totalApplications,
      active_collaborations: activeCollabs,
      collaborations_completed: completedCollabs,
      average_roi: 0,
      profile_views: 0,
      average_rating: 0,
    },
    charts: { application_status_distribution: distData },
    growth: { campaign_growth: 0, application_growth: 0, collaboration_growth: 0 },
    metadata: { period: "30d" },
  };
}

export async function savePromoter(user, promoterId) {
  return discovery.savePromoter(user, promoterId);
}

export async function removeSavedPromoter(user, promoterId) {
  return discovery.removeSavedPromoter(user, promoterId);
}

export async function getSavedPromoters(user, params) {
  return discovery.getSavedPromoters(user, params);
}
