import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";

export async function listMarketplaceCampaigns(user, params = {}) {
  const { search, category, page = 1, limit = 20, sort = "createdAt" } = params;

  const where = { status: "OPEN", visibility: "PUBLIC" };
  if (category) where.category = { contains: category, mode: "insensitive" };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  const total = await prisma.campaign.count({ where });
  const campaigns = await prisma.campaign.findMany({
    where,
    include: { businessProfile: true },
    orderBy: { [sort]: "desc" },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const campaignIds = campaigns.map((c) => c.id);

  let appliedSet = new Set();
  let bookmarkedSet = new Set();
  if (user && user.role === ROLE.PROMOTER && user.promoterProfile) {
    const pid = user.promoterProfile.id;
    const apps = await prisma.campaignApplication.findMany({
      where: { promoterProfileId: pid, status: { not: "WITHDRAWN" } },
      select: { campaignId: true },
    });
    appliedSet = new Set(apps.map((a) => a.campaignId));
    const bookmarks = await prisma.savedCampaign.findMany({
      where: { promoterProfileId: pid },
      select: { campaignId: true },
    });
    bookmarkedSet = new Set(bookmarks.map((b) => b.campaignId));
  }

  let applicantCounts = {};
  if (campaignIds.length) {
    const counts = await prisma.campaignApplication.groupBy({
      by: ["campaignId"],
      where: { campaignId: { in: campaignIds } },
      _count: { _all: true },
    });
    applicantCounts = Object.fromEntries(counts.map((c) => [c.campaignId, c._count._all]));
  }

  const items = campaigns.map((c) => ({
    id: c.id,
    businessProfileId: c.businessProfileId,
    title: c.title,
    description: c.description,
    category: c.category,
    budget: c.budget,
    location: c.location,
    targetAudience: c.targetAudience,
    requirements: c.requirements,
    startDate: c.startDate,
    endDate: c.endDate,
    createdAt: c.createdAt,
    businessName: c.businessProfile?.companyName ?? "",
    hasApplied: appliedSet.has(c.id),
    isBookmarked: bookmarkedSet.has(c.id),
    applicantCount: applicantCounts[c.id] ?? 0,
  }));

  return [items, total];
}

export async function toggleBookmark(user, campaignId, bookmarked) {
  if (user.role !== ROLE.PROMOTER) throw new AppError("Only promoters can bookmark campaigns", 403);
  const profile = user.promoterProfile;
  if (!profile) throw new AppError("Promoter profile not found", 404);

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new AppError("Campaign not found", 404);

  const existing = await prisma.savedCampaign.findUnique({
    where: { promoterProfileId_campaignId: { promoterProfileId: profile.id, campaignId } },
  });

  if (bookmarked) {
    if (!existing) {
      await prisma.savedCampaign.create({ data: { promoterProfileId: profile.id, campaignId } });
    }
  } else if (existing) {
    await prisma.savedCampaign.delete({ where: { id: existing.id } });
  }

  return { success: true, bookmarked };
}
