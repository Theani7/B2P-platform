import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";
import * as discovery from "../discovery/service.js";

function ensurePromoter(user) {
  if (user.role !== ROLE.PROMOTER) {
    throw new AppError("Only PROMOTER users can manage promoter profiles", 403);
  }
}

async function withPendingVerification(profile) {
  const pending = await prisma.verificationRequest.findFirst({
    where: { promoterProfileId: profile.id, status: "PENDING" },
  });
  return { ...profile, hasPendingVerification: !!pending };
}

export async function createOrUpdate(user, payload) {
  ensurePromoter(user);

  if (payload.username) {
    const existing = await prisma.promoterProfile.findFirst({
      where: { username: payload.username, NOT: { userId: user.id } },
    });
    if (existing) throw new AppError("Username already taken", 409);
  }

  let profile = await prisma.promoterProfile.findUnique({ where: { userId: user.id } });
  if (profile) {
    await prisma.promoterProfile.update({ where: { id: profile.id }, data: payload });
  } else {
    profile = await prisma.promoterProfile.create({ data: { userId: user.id, ...payload } });
  }
  const reloaded = await prisma.promoterProfile.findUnique({ where: { id: profile.id } });
  return withPendingVerification(reloaded);
}

export async function getMyProfile(user) {
  ensurePromoter(user);
  const profile = await prisma.promoterProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Profile not found", 404);
  return withPendingVerification(profile);
}

export async function deleteProfile(user) {
  ensurePromoter(user);
  const profile = await prisma.promoterProfile.findUnique({ where: { userId: user.id } });
  if (profile) {
    await prisma.promoterProfile.delete({ where: { id: profile.id } });
  }
  return { success: true, message: "Profile deleted" };
}

export async function analytics(user) {
  const profile = await prisma.promoterProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return {
      summary: {
        profile_views: 0, applications_submitted: 0, accepted_applications: 0,
        pending_applications: 0, rejected_applications: 0, invitations_received: 0,
        invitations_accepted: 0, invitations_pending: 0, active_collaborations: 0,
        completed_collaborations: 0, average_rating: 0, reviews_received: 0,
        recommendation_percent: 0, portfolio_items: 0, profile_completion: 0,
      },
      charts: {}, growth: {}, recent: {}, metadata: { period: "30d" },
    };
  }

  const applicationsSubmitted = await prisma.campaignApplication.count({ where: { promoterProfileId: profile.id } });
  const pendingApps = await prisma.campaignApplication.count({ where: { promoterProfileId: profile.id, status: "PENDING" } });
  const acceptedApps = await prisma.campaignApplication.count({ where: { promoterProfileId: profile.id, status: "ACCEPTED" } });
  const rejectedApps = await prisma.campaignApplication.count({ where: { promoterProfileId: profile.id, status: "REJECTED" } });
  const activeCollabs = await prisma.collaboration.count({ where: { promoterProfileId: profile.id, status: "ACTIVE" } });
  const completedCollabs = await prisma.collaboration.count({ where: { promoterProfileId: profile.id, status: "COMPLETED" } });
  const reviewsReceived = await prisma.review.count({ where: { revieweeId: user.id } });
  const avg = await prisma.review.aggregate({ where: { revieweeId: user.id }, _avg: { rating: true } });
  const portfolioItems = await prisma.portfolioItem.count({ where: { promoterId: profile.id } });

  return {
    summary: {
      profile_views: 0,
      applications_submitted: applicationsSubmitted,
      accepted_applications: acceptedApps,
      pending_applications: pendingApps,
      rejected_applications: rejectedApps,
      invitations_received: 0,
      invitations_accepted: 0,
      invitations_pending: 0,
      active_collaborations: activeCollabs,
      completed_collaborations: completedCollabs,
      average_rating: avg._avg.rating ? Number(avg._avg.rating.toFixed(1)) : 0,
      reviews_received: reviewsReceived,
      recommendation_percent: 0,
      portfolio_items: portfolioItems,
      profile_completion: 0,
    },
    charts: {}, growth: { application_growth: 0, collaboration_growth: 0 }, recent: {}, metadata: { period: "30d" },
  };
}

export async function publicProfile(username) {
  return discovery.getPublicProfile(username);
}

export async function directory(params) {
  return discovery.searchPromoters(params);
}
