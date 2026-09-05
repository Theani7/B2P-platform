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

  const col = SORT_COLS[sortBy] || "createdAt";
  const order = sortOrder === "asc" ? "asc" : "desc";

  const [items, total] = await Promise.all([
    prisma.promoterProfile.findMany({
      where,
      select: {
        id: true,
        userId: true,
        username: true,
        headline: true,
        bio: true,
        niche: true,
        location: true,
        avatarUrl: true,
        followersCount: true,
        engagementRate: true,
        yearsExperience: true,
        verified: true,
      },
      orderBy: { [col]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.promoterProfile.count({ where }),
  ]);

  const counts = await prisma.follow.groupBy({
    by: ["followingId"],
    where: { followingId: { in: items.map((i) => i.userId) } },
    _count: { followingId: true },
  });
  const countByUser = new Map(counts.map((c) => [c.followingId, c._count.followingId]));
  const withFollows = items.map((i) => ({
    ...i,
    inAppFollowers: countByUser.get(i.userId) ?? 0,
  }));

  return [withFollows, total];
}

export async function getPublicProfile(username) {
  const profile = await prisma.promoterProfile.findUnique({
    where: { username },
    select: {
      id: true,
      userId: true,
      username: true,
      headline: true,
      bio: true,
      niche: true,
      location: true,
      avatarUrl: true,
      followersCount: true,
      engagementRate: true,
      yearsExperience: true,
      verified: true,
      portfolioItems: {
        select: {
          id: true,
          title: true,
          clientName: true,
          description: true,
          coverImage: true,
          featured: true,
          platforms: true,
          tags: true,
          media: { select: { id: true, filePath: true, mediaType: true, displayOrder: true }, orderBy: { displayOrder: "asc" } },
        },
      },
      user: { select: { socialLinks: { select: { id: true, platform: true, username: true, url: true } } } },
    },
  });
  if (!profile) throw new AppError("Promoter not found", 404);

  const inAppFollowers = await prisma.follow.count({ where: { followingId: profile.userId } });

  return {
    ...profile,
    inAppFollowers,
    socialLinks: profile.user?.socialLinks || [],
  };
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

  const [items, total] = await Promise.all([
    prisma.savedPromoter.findMany({
      where,
      include: { promoterProfile: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.savedPromoter.count({ where }),
  ]);
  return [items, total];
}
