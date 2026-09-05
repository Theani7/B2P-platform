import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";


async function auditLog(userId, action, entityType, entityId, req) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        ipAddress: req?.ip || null,
        userAgent: req?.headers?.["user-agent"]?.slice(0, 500) || null,
      },
    });
  } catch {
    // Audit logging must never block the primary operation.
  }
}

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
export async function getAdminUsers({ page = 1, limit = 20, search, role, isActive, sort = "newest" }) {
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

  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "name"
        ? [{ fullName: "asc" }, { username: "asc" }]
        : sort === "role"
          ? [{ role: "asc" }, { createdAt: "desc" }]
          : { createdAt: "desc" };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastLoginAt: true,
        businessProfile: { select: { id: true } },
        promoterProfile: { select: { id: true } },
      },
      orderBy,
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
  await auditLog(adminUser?.id, "ADMIN_SUSPEND_USER", "user", user.id, req);
  return { success: true };
}

export async function activateUser(adminUser, userId, req) {
  const user = await getUserOr404(userId);
  await prisma.user.update({ where: { id: user.id }, data: { isActive: true } });
  await auditLog(adminUser?.id, "ADMIN_ACTIVATE_USER", "user", user.id, req);
  return { success: true };
}

/** Delete a user plus every dependent row. Shared by admin delete and self-service account deletion. */
export async function deleteUserCascade(user) {

  // Explicit cleanup in dependency order: several relations (reviews, messages,
  // likes, campaigns, applications, ...) have no ON DELETE cascade, so a plain
  // user.delete would 500 with a FK violation for active users.
  const bizId = user.businessProfile?.id;
  const promId = user.promoterProfile?.id;

  // Campaign + collaboration ids owned by these profiles (needed for dependents).
  const campaignIds = bizId
    ? (await prisma.campaign.findMany({ where: { businessProfileId: bizId }, select: { id: true } })).map((c) => c.id)
    : [];
  const collabIds = await prisma.collaboration
    .findMany({
      where: {
        OR: [
          ...(bizId ? [{ businessProfileId: bizId }] : []),
          ...(promId ? [{ promoterProfileId: promId }] : []),
        ],
      },
      select: { id: true },
    })
    .then((rows) => rows.map((c) => c.id));

  await prisma.$transaction(async (tx) => {
    if (collabIds.length) {
      await tx.review.deleteMany({ where: { collaborationId: { in: collabIds } } });
      await tx.deliverable.deleteMany({ where: { collaborationId: { in: collabIds } } });
      // NOTE: Conversation.campaignId stores the collaboration id (see schema).
      const convos = await tx.conversation.findMany({
        where: { campaignId: { in: collabIds } },
        select: { id: true },
      });
      if (convos.length) {
        await tx.message.deleteMany({ where: { conversationId: { in: convos.map((c) => c.id) } } });
        await tx.conversation.deleteMany({ where: { id: { in: convos.map((c) => c.id) } } });
      }
      await tx.collaboration.deleteMany({ where: { id: { in: collabIds } } });
    }
    if (campaignIds.length) {
      await tx.campaignApplication.deleteMany({ where: { campaignId: { in: campaignIds } } });
      await tx.campaignInvitation.deleteMany({ where: { campaignId: { in: campaignIds } } });
      await tx.matchResult.deleteMany({ where: { campaignId: { in: campaignIds } } });
      await tx.savedCampaign.deleteMany({ where: { campaignId: { in: campaignIds } } });
      await tx.campaign.deleteMany({ where: { id: { in: campaignIds } } });
    }
    if (promId) {
      const itemIds = (
        await tx.portfolioItem.findMany({ where: { promoterId: promId }, select: { id: true } })
      ).map((i) => i.id);
      if (itemIds.length) {
        await tx.portfolioLike.deleteMany({ where: { portfolioItemId: { in: itemIds } } });
        await tx.portfolioItem.deleteMany({ where: { id: { in: itemIds } } });
      }
      await tx.campaignApplication.deleteMany({ where: { promoterProfileId: promId } });
      await tx.campaignInvitation.deleteMany({ where: { promoterProfileId: promId } });
      await tx.matchResult.deleteMany({ where: { promoterProfileId: promId } });
      await tx.savedCampaign.deleteMany({ where: { promoterProfileId: promId } });
      await tx.savedPromoter.deleteMany({ where: { promoterProfileId: promId } });
      await tx.verificationRequest.deleteMany({ where: { promoterProfileId: promId } });
    }
    if (bizId) {
      await tx.savedPromoter.deleteMany({ where: { businessProfileId: bizId } });
      await tx.verificationRequest.deleteMany({ where: { businessProfileId: bizId } });
    }
    // User-level dependents without cascade.
    await tx.review.deleteMany({ where: { OR: [{ reviewerId: user.id }, { revieweeId: user.id }] } });
    await tx.message.deleteMany({ where: { senderId: user.id } });
    await tx.portfolioLike.deleteMany({ where: { userId: user.id } });
    await tx.auditLog.deleteMany({ where: { userId: user.id } });
    await tx.verificationRequest.updateMany({ where: { reviewedBy: user.id }, data: { reviewedBy: null } });
    // Cascades (profiles, social links, notification prefs, received notifications) delete automatically.
    await tx.user.delete({ where: { id: user.id } });
  });

  return { success: true };
}

export async function deleteUser(adminUser, userId, req) {
  const user = await getUserOr404(userId);
  if (user.role === ROLE.ADMIN) throw new AppError("Cannot delete admin users", 400);

  await deleteUserCascade(user);

  await auditLog(adminUser?.id, "ADMIN_DELETE_USER", "user", user.id, req);
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
  await auditLog(adminUser?.id, "ADMIN_ARCHIVE_CAMPAIGN", "campaign", campaignId, req);
  return { success: true };
}

export async function cancelCampaign(adminUser, campaignId, req) {
  await getCampaignOr404(campaignId);
  await prisma.campaign.update({ where: { id: campaignId }, data: { status: "CANCELLED" } });
  await auditLog(adminUser?.id, "ADMIN_CANCEL_CAMPAIGN", "campaign", campaignId, req);
  return { success: true };
}

// --- Review Moderation ---
export async function getAdminReviews({ page = 1, limit = 20, search }) {
  const where = {};
  if (search) where.comment = { contains: search, mode: "insensitive" };

  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        reviewer: { select: { username: true } },
        reviewee: { select: { username: true } },
      },
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
  await auditLog(adminUser?.id, "ADMIN_DELETE_REVIEW", "review", reviewId, req);
  return { success: true };
}



// --- Audit Logs ---
export async function listAuditLogs({ page = 1, limit = 20, search, action, userId, dateFrom, dateTo }) {
  const where = {};
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (!Number.isNaN(from.getTime())) where.createdAt.gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      if (!Number.isNaN(to.getTime())) where.createdAt.lte = to;
    }
    if (Object.keys(where.createdAt).length === 0) delete where.createdAt;
  }
  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { entityType: { contains: search, mode: "insensitive" } },
      { entityId: { contains: search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.auditLog.count({ where }),
  ]);

  const items = rows.map((a) => ({
    id: a.id,
    userId: a.userId,
    username: a.user?.username || null,
    action: a.action,
    entityType: a.entityType,
    entityId: a.entityId,
    ipAddress: a.ipAddress,
    createdAt: a.createdAt,
  }));

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.max(1, Math.ceil(total / Number(limit))),
  };
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
  await auditLog(adminUser?.id, "ADMIN_UPDATE_SETTING", "platform_setting", settingKey, req);
  return {
    id: setting.id,
    settingKey: setting.settingKey,
    settingValue: setting.settingValue,
    description: setting.description,
    updatedAt: setting.updatedAt,
  };
}

export async function deleteSetting(adminUser, settingKey, req) {
  const setting = await prisma.platformSetting.findUnique({ where: { settingKey } });
  if (!setting) throw new AppError("Setting not found", 404);
  await prisma.platformSetting.delete({ where: { settingKey } });
  await auditLog(adminUser?.id, "ADMIN_DELETE_SETTING", "platform_setting", settingKey, req);
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
