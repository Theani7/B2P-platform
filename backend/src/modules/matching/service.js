import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";
import { createNotification } from "../../shared/notify.js";

const RELATED_NICHES = {
  LIFESTYLE: ["FASHION", "TRAVEL", "FOOD", "FITNESS"],
  TECH: ["GAMING", "BUSINESS"],
  FASHION: ["LIFESTYLE"],
  FOOD: ["LIFESTYLE", "TRAVEL"],
  TRAVEL: ["LIFESTYLE", "FOOD"],
  FITNESS: ["LIFESTYLE"],
  GAMING: ["TECH"],
  BUSINESS: ["TECH"],
  OTHER: [],
};

function scoreNiche(campaignCategory, promoterNiche) {
  if (campaignCategory.toUpperCase() === promoterNiche.toUpperCase()) return 40;
  const related = RELATED_NICHES[campaignCategory.toUpperCase()] || [];
  if (related.includes(promoterNiche.toUpperCase())) return 20;
  return 0;
}

function scoreLocation(campaignLocation, promoterLocation) {
  if (!promoterLocation) return 0;
  return campaignLocation.toLowerCase() === promoterLocation.toLowerCase() ? 20 : 0;
}

function scoreFollowers(count) {
  if (count >= 100000) return 15;
  if (count >= 50000) return 10;
  if (count >= 10000) return 5;
  return 0;
}

function scoreExperience(years) {
  if (years == null) return 0;
  if (years >= 5) return 10;
  if (years >= 3) return 7;
  if (years >= 1) return 5;
  return 0;
}

function scoreEngagement(rate) {
  if (rate >= 10) return 15;
  if (rate >= 5) return 10;
  if (rate >= 2) return 5;
  return 0;
}

function classify(score) {
  if (score >= 90) return "EXCELLENT_MATCH";
  if (score >= 70) return "GOOD_MATCH";
  if (score >= 50) return "AVERAGE_MATCH";
  return "LOW_MATCH";
}

function generateExplanation(breakdown) {
  const parts = [];
  if (breakdown.niche === 40) parts.push("Niche matches campaign");
  else if (breakdown.niche === 20) parts.push("Niche is related to campaign category");
  if (breakdown.location > 0) parts.push("Same location");
  if (breakdown.followers >= 10) parts.push("High follower count");
  else if (breakdown.followers > 0) parts.push("Moderate follower base");
  if (breakdown.engagement >= 10) parts.push("High engagement rate");
  else if (breakdown.engagement > 0) parts.push("Good engagement rate");
  if (breakdown.experience >= 7) parts.push("Strong experience level");
  else if (breakdown.experience > 0) parts.push("Some experience");
  if (!parts.length) parts.push("General profile match");
  return "Recommended because: " + parts.join("; ");
}

async function businessProfileOf(user) {
  if (user.role !== ROLE.BUSINESS) throw new AppError("Only BUSINESS users can perform this action", 403);
  const profile = user.businessProfile;
  if (!profile) throw new AppError("Business profile not found", 404);
  return profile;
}

async function campaignForBusiness(campaignId, businessProfileId) {
  const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, businessProfileId } });
  if (!campaign) throw new AppError("Campaign not found", 404);
  return campaign;
}

export async function generateMatches(user, campaignId) {
  const profile = await businessProfileOf(user);
  const campaign = await campaignForBusiness(campaignId, profile.id);

  const promoters = await prisma.promoterProfile.findMany();

  const ops = [];
  for (const promoter of promoters) {
    const breakdown = {
      niche: scoreNiche(campaign.category, promoter.niche),
      location: scoreLocation(campaign.location, promoter.location),
      followers: scoreFollowers(promoter.followersCount),
      experience: scoreExperience(promoter.yearsExperience),
      engagement: scoreEngagement(promoter.engagementRate),
    };
    const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const classification = classify(score);

    ops.push(
      prisma.matchResult.upsert({
        where: { campaignId_promoterProfileId: { campaignId: campaign.id, promoterProfileId: promoter.id } },
        create: {
          campaignId: campaign.id,
          promoterProfileId: promoter.id,
          score,
          classification,
          scoreBreakdown: breakdown,
        },
        update: { score, classification, scoreBreakdown: breakdown },
      })
    );
  }

  // Persist all match results atomically in a single transaction.
  await prisma.$transaction(ops);
  const count = ops.length;

  await createNotification({
    recipientId: user.id,
    actorId: user.id,
    type: "CAMPAIGN_MATCH_READY",
    title: "Match analysis ready",
    message: `We found ${count} potential promoters for your campaign '${campaign.title}'`,
    entityType: "campaign",
    entityId: campaign.id,
  });

  return count;
}

export async function getMatches(user, campaignId, params = {}) {
  const profile = await businessProfileOf(user);
  const campaign = await campaignForBusiness(campaignId, profile.id);
  const { page = 1, limit = 10, classification, minScore, verified } = params;

  const where = { campaignId: campaign.id };
  if (classification) where.classification = classification;
  if (minScore != null) where.score = { gte: Number(minScore) };

  const queryOptions = {
    where,
    include: { promoterProfile: true },
    orderBy: { score: "desc" },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  };
  if (verified === true) {
    queryOptions.where.promoterProfile = { is: { verified: true } };
  }

  const [raw, total] = await Promise.all([
    prisma.matchResult.findMany(queryOptions),
    prisma.matchResult.count({ where: queryOptions.where }),
  ]);

  const items = raw
    .filter((m) => m.promoterProfile)
    .map((m) => {
      const p = m.promoterProfile;
      const breakdown = m.scoreBreakdown || {};
      return {
        id: m.id,
        campaignId: m.campaignId,
        promoter: {
          id: p.id,
          username: p.username,
          headline: p.headline,
          avatarUrl: p.avatarUrl,
          niche: p.niche,
          location: p.location,
          followersCount: p.followersCount,
          engagementRate: p.engagementRate,
          yearsExperience: p.yearsExperience,
          verified: p.verified,
        },
        score: m.score,
        classification: m.classification,
        scoreBreakdown: breakdown,
        createdAt: m.createdAt,
        explanation: generateExplanation(breakdown),
      };
    });

  return [items, total];
}
