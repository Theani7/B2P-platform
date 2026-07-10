import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";


async function getUserOr404(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { businessProfile: true, promoterProfile: true },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
}

// --- Dashboard ---
export async function getDashboardStats() {
  const [
    totalUsers,
    totalBusinesses,
    totalPromoters,
    verifiedPromoters,
    totalCampaigns,
    totalApplications,
    totalCollaborations,
    totalReviews,
    openVerifications,
    avgAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: ROLE.BUSINESS } }),
    prisma.user.count({ where: { role: ROLE.PROMOTER } }),
    prisma.promoterProfile.count({ where: { verified: true } }),
    prisma.campaign.count(),
    prisma.campaignApplication.count(),
    prisma.collaboration.count(),
    prisma.review.count(),
    prisma.verificationRequest.count({ where: { status: "PENDING" } }),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ]);

  return {
    totalUsers,
    totalBusinesses,
    totalPromoters,
    verifiedPromoters,
    totalCampaigns,
    totalApplications,
    totalCollaborations,
    totalReviews,
    averageRating: Math.round((avgAgg._avg.rating || 0) * 10) / 10,
    openVerificationRequests: openVerifications,
  };
}

// --- User Management ---
export async function getAdminUsers({ page = 1, limit = 20, search, role, isActive }) {
  const where = {};
  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  if (isActive !== undefined && isActive !== null) where.isActive = isActive === true;

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { businessProfile: true, promoterProfile: true },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);

  const items = rows.map((u) => ({
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    hasBusinessProfile: !!u.businessProfile,
    hasPromoterProfile: !!u.promoterProfile,
  }));

  return [items, total];
}

function userRead(u) {
  return {
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    hasBusinessProfile: !!u.businessProfile,
    hasPromoterProfile: !!u.promoterProfile,
  };
}

export async function getAdminUserDetail(userId) {
  const user = await getUserOr404(userId);
  return userRead(user);
}

export async function suspendUser(adminUser, userId, req) {
  const user = await getUserOr404(userId);
  if (user.role === ROLE.ADMIN) throw new AppError("Cannot suspend admin users", 400);
  await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
  return { success: true };
}

export async function activateUser(adminUser, userId, req) {
  const user = await getUserOr404(userId);
  await prisma.user.update({ where: { id: user.id }, data: { isActive: true } });
  return { success: true };
}

export async function deleteUser(adminUser, userId, req) {
  const user = await getUserOr404(userId);
  if (user.role === ROLE.ADMIN) throw new AppError("Cannot delete admin users", 400);
  await prisma.user.delete({ where: { id: user.id } });
  return { success: true };
}

// --- Campaign Moderation ---
export async function getAdminCampaigns({ page = 1, limit = 20, search, status }) {
  const where = {};
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  const [rows, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      include: { businessProfile: true },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.campaign.count({ where }),
  ]);

  const items = rows.map((c) => ({
    id: c.id,
    title: c.title,
    businessCompanyName: c.businessProfile?.companyName || "",
    category: c.category,
    budget: Number(c.budget),
    location: c.location,
    status: c.status,
    visibility: c.visibility,
    createdAt: c.createdAt,
  }));

  return [items, total];
}

async function getCampaignOr404(campaignId) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new AppError("Campaign not found", 404);
  return campaign;
}

export async function archiveCampaign(adminUser, campaignId, req) {
  await getCampaignOr404(campaignId);
  await prisma.campaign.update({ where: { id: campaignId }, data: { status: "ARCHIVED" } });
  return { success: true };
}

export async function cancelCampaign(adminUser, campaignId, req) {
  await getCampaignOr404(campaignId);
  await prisma.campaign.update({ where: { id: campaignId }, data: { status: "CANCELLED" } });
  return { success: true };
}

// --- Review Moderation ---
export async function getAdminReviews({ page = 1, limit = 20, search }) {
  const where = {};
  if (search) where.comment = { contains: search, mode: "insensitive" };

  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { reviewer: true, reviewee: true },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.review.count({ where }),
  ]);

  const items = rows.map((r) => ({
    id: r.id,
    collaborationId: r.collaborationId,
    reviewerUsername: r.reviewer?.username || "",
    revieweeUsername: r.reviewee?.username || "",
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
  }));

  return [items, total];
}

export async function deleteReview(adminUser, reviewId, req) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError("Review not found", 404);
  await prisma.review.delete({ where: { id: reviewId } });
  return { success: true };
}



// --- Platform Settings ---
export async function getSettings() {
  const settings = await prisma.platformSetting.findMany({ orderBy: { settingKey: "asc" } });
  return settings.map((s) => ({
    id: s.id,
    settingKey: s.settingKey,
    settingValue: s.settingValue,
    description: s.description,
    updatedAt: s.updatedAt,
  }));
}

const DEFAULT_SETTINGS = [
  {
    settingKey: "campaign_categories",
    settingValue: "TECH,FASHION,FOOD,TRAVEL,FITNESS,LIFESTYLE,GAMING,BUSINESS,HEALTH,EDUCATION,ENTERTAINMENT,OTHER",
    description: "Available campaign categories",
  },
  {
    settingKey: "industries",
    settingValue: "TECH,FINANCE,HEALTH,RETAIL,FOOD,TRAVEL,EDUCATION,ENTERTAINMENT,REAL_ESTATE,FASHION,OTHER",
    description: "Available business industries",
  },
  {
    settingKey: "promoter_niches",
    settingValue: "LIFESTYLE,TECH,FASHION,FOOD,TRAVEL,FITNESS,GAMING,BUSINESS,OTHER",
    description: "Available promoter niches",
  },
  {
    settingKey: "support_email",
    settingValue: "support@byparsathy.com",
    description: "Platform support email address",
  },
];

export async function seedSettings() {
  for (const def of DEFAULT_SETTINGS) {
    await prisma.platformSetting.upsert({
      where: { settingKey: def.settingKey },
      update: {},
      create: { settingKey: def.settingKey, settingValue: def.settingValue, description: def.description },
    });
  }
  return { success: true };
}

export async function updateSetting(adminUser, settingKey, settingValue, description, req) {
  const setting = await prisma.platformSetting.upsert({
    where: { settingKey },
    update: { settingValue, description: description ?? undefined },
    create: { settingKey, settingValue, description },
  });
  return {
    id: setting.id,
    settingKey: setting.settingKey,
    settingValue: setting.settingValue,
    description: setting.description,
    updatedAt: setting.updatedAt,
  };
}

export async function deleteSetting(settingKey) {
  const setting = await prisma.platformSetting.findUnique({ where: { settingKey } });
  if (!setting) throw new AppError("Setting not found", 404);
  await prisma.platformSetting.delete({ where: { settingKey } });
  return { success: true };
}

// --- Analytics ---
export async function getAnalytics() {
  const [
    totalUsers,
    totalBusinesses,
    totalPromoters,
    verifiedPromoters,
    totalCampaigns,
    totalApplications,
    totalCollaborations,
    totalReviews,
    avgAgg,
    niches,
    locations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: ROLE.BUSINESS } }),
    prisma.user.count({ where: { role: ROLE.PROMOTER } }),
    prisma.promoterProfile.count({ where: { verified: true } }),
    prisma.campaign.count(),
    prisma.campaignApplication.count(),
    prisma.collaboration.count(),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.promoterProfile.groupBy({
      by: ["niche"],
      _count: { _all: true },
      orderBy: { _count: { niche: "desc" } },
      take: 10,
    }),
    prisma.campaign.groupBy({
      by: ["location"],
      _count: { _all: true },
      orderBy: { _count: { location: "desc" } },
      take: 10,
    }),
  ]);

  const accepted = await prisma.collaboration.count({ where: { status: "ACTIVE" } });
  const acceptanceRate =
    totalCollaborations > 0 ? Math.round((accepted / totalCollaborations) * 100 * 10) / 10 : 0;

  const topNiches = {};
  for (const n of niches) topNiches[n.niche || "unknown"] = n._count._all;
  const topLocations = {};
  for (const l of locations) topLocations[l.location || "unknown"] = l._count._all;

  return {
    totalUsers,
    totalBusinesses,
    totalPromoters,
    verifiedPromoters,
    totalCampaigns,
    totalApplications,
    totalCollaborations,
    totalReviews,
    acceptanceRate,
    averageRating: Math.round((avgAgg._avg.rating || 0) * 10) / 10,
    topNiches,
    topLocations,
  };
}
