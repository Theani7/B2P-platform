import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";

const SORT_COLS = {
  newest: "createdAt",
  followers_count: "followersCount",
  engagement_rate: "engagementRate",
  years_experience: "yearsExperience",
  username: "username",
};

export async function searchPromoters(params = {}) {
  const {
    search = "",
    niche,
    location,
    verified,
    followersMin,
    followersMax,
    experienceMin,
    experienceMax,
    sortBy = "newest",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = params;

  const where = {};
  if (search) {
    const like = search;
    where.OR = [
      { username: { contains: like, mode: "insensitive" } },
      { headline: { contains: like, mode: "insensitive" } },
      { bio: { contains: like, mode: "insensitive" } },
      { niche: { contains: like, mode: "insensitive" } },
      { location: { contains: like, mode: "insensitive" } },
    ];
  }
  if (niche) where.niche = niche.toUpperCase();
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (verified !== undefined && verified !== null) where.verified = verified;
  if (followersMin !== undefined && followersMin !== null) where.followersCount = { gte: followersMin };
  if (followersMax !== undefined && followersMax !== null) where.followersCount = { ...(where.followersCount || {}), lte: followersMax };
  if (experienceMin !== undefined && experienceMin !== null) where.yearsExperience = { gte: experienceMin };
  if (experienceMax !== undefined && experienceMax !== null) where.yearsExperience = { ...(where.yearsExperience || {}), lte: experienceMax };

  const total = await prisma.promoterProfile.count({ where });

  const col = SORT_COLS[sortBy] || "createdAt";
  const order = sortOrder === "asc" ? "asc" : "desc";

  const items = await prisma.promoterProfile.findMany({
    where,
    orderBy: { [col]: order },
    skip: (page - 1) * limit,
    take: limit,
  });

  return [items, total];
}

export async function getPublicProfile(username) {
  const profile = await prisma.promoterProfile.findUnique({
    where: { username },
    include: {
      portfolioItems: { include: { media: { orderBy: { displayOrder: "asc" } } } },
      user: { include: { socialLinks: true } },
    },
  });
  if (!profile) throw new AppError("Promoter not found", 404);
  return profile;
}

async function ensureBusinessProfile(user) {
  if (user.role !== ROLE.BUSINESS) {
    throw new AppError("Only BUSINESS users can perform this action", 403);
  }
  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Business profile not found", 404);
  return profile;
}

export async function savePromoter(user, promoterId) {
  const business = await ensureBusinessProfile(user);

  const promoter = await prisma.promoterProfile.findUnique({ where: { id: promoterId } });
  if (!promoter) throw new AppError("Promoter not found", 404);

  const existing = await prisma.savedPromoter.findFirst({
    where: { businessProfileId: business.id, promoterProfileId: promoterId },
  });
  if (existing) throw new AppError("Promoter already saved", 409);

  const saved = await prisma.savedPromoter.create({
    data: { businessProfileId: business.id, promoterProfileId: promoterId },
  });
  return saved;
}

export async function removeSavedPromoter(user, promoterId) {
  const business = await ensureBusinessProfile(user);
  const saved = await prisma.savedPromoter.findFirst({
    where: { businessProfileId: business.id, promoterProfileId: promoterId },
  });
  if (!saved) throw new AppError("Saved promoter not found", 404);
  await prisma.savedPromoter.delete({ where: { id: saved.id } });
}

export async function getSavedPromoters(user, { search = "", page = 1, limit = 20 }) {
  const business = await ensureBusinessProfile(user);

  const where = { businessProfileId: business.id };
  if (search) {
    where.OR = [
      { promoterProfile: { username: { contains: search, mode: "insensitive" } } },
      { promoterProfile: { headline: { contains: search, mode: "insensitive" } } },
      { promoterProfile: { niche: { contains: search, mode: "insensitive" } } },
    ];
  }

  const total = await prisma.savedPromoter.count({ where });
  const items = await prisma.savedPromoter.findMany({
    where,
    include: { promoterProfile: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return [items, total];
}
