import { Groq } from "groq-sdk";
import { AppError } from "../../shared/errors.js";
import { config } from "../../config/env.js";
import { prisma } from "../../config/db.js";
import * as matchingService from "../matching/service.js";
import { listMarketplaceCampaigns } from "../marketplace/service.js";

const { generateMatches, getMatches } = matchingService;

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError("Groq API key is not configured. Please add it to your .env file.", 500);
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const PLATFORM_NAME = config.projectName || "Byparsathy";

const PLATFORM_KNOWLEDGE = `${PLATFORM_NAME} is a platform that connects Businesses with Promoters/Influencers for marketing campaigns.

Core concepts:
- Roles: BUSINESS (brands/companies), PROMOTER (influencers/creators), ADMIN (platform staff).
- Profiles: Businesses fill company details (industry, location, website, logo, size). Promoters fill username, headline, bio, niche, location, follower counts, engagement rate, experience, portfolio items, and social links. A verified badge can be earned via a verification request.
- Campaigns: Businesses create campaigns with a status lifecycle: DRAFT -> OPEN -> ACTIVE -> COMPLETED, or ARCHIVED / CANCELLED. Published (OPEN + PUBLIC) campaigns appear in the Promoter Marketplace.
- Discovery: Businesses can search/filter/sort the Promoter directory and save (shortlist) promoters.
- Applications: Promoters apply to OPEN campaigns. Businesses accept or reject applications; accepting creates a Collaboration. Withdrawing is allowed before acceptance.
- Invitations: Businesses invite specific promoters to campaigns; promoters accept/reject. Accepting creates a Collaboration.
- Matching: Businesses can generate AI match scores for promoters based on niche, location, followers, experience, and engagement; results are classified EXCELLENT/GOOD/FAIR/POOR.
- Collaborations: an active partnership linking a campaign, business, and promoter. Deliverables are submitted by promoters and reviewed by businesses (APPROVED / REVISION_REQUESTED / PUBLISHED).
- Reviews & Ratings: After a collaboration completes, both parties leave 1-5 star mutual reviews; ratings feed a public average + star distribution.
- Chat & Notifications: Real-time messaging (socket.io) is available inside active collaborations; notifications are delivered in-app and realtime.
- Achievements: Users earn badges (e.g. Complete Profile, First Portfolio) for platform activity.
- Help is available via the AI assistant for both businesses and promoters to explain features and guide actions.`;

const rolePrompt = (role) => {
  const base = `You are ${PLATFORM_NAME} Assistant, a helpful, concise AI guide for the ${PLATFORM_NAME} platform (a Brand-to-Promoter collaboration marketplace).`;
  if (role === "BUSINESS") {
    return `${base} The user is a BUSINESS (brand/company). Help them understand and use: creating campaigns, publishing to the marketplace, discovering and saving promoters, inviting promoters, reviewing applications, generating AI matches, managing collaborations and reviewing deliverables, and reading reviews. Give concrete step-by-step guidance and mention the relevant page when useful.`;
  }
  if (role === "PROMOTER") {
    return `${base} The user is a PROMOTER (influencer/creator). Help them understand and use: completing their profile (bio, niche, portfolio, social links, verification), browsing the campaign marketplace, applying to campaigns, accepting invitations, submitting deliverables in collaborations, and building their review rating. Give concrete step-by-step guidance and mention the relevant page when useful.`;
  }
  return `${base} The user is platform staff (ADMIN). Help them understand dashboards, user/campaign/review moderation, verification approvals, and platform settings.`;
};

const GUARDRAILS = `Guardrails:
- You are a user-facing product assistant. NEVER mention internal implementation details, backend architecture, third-party providers, APIs, model names, keys, or infrastructure (e.g. Groq, socket.io, Prisma, PostgreSQL, tokens).
- Speak only as a helpful guide for using the ${PLATFORM_NAME} product. If asked about technical internals, politely decline and redirect to how features help the user.`;

// --- Live data context (so the assistant can answer account-specific questions) ---

async function buildBusinessContext(user, campaignId) {
  if (!user.businessProfile) return null;
  const bpId = user.businessProfile.id;

  const [all, open, active, draft] = await Promise.all([
    prisma.campaign.count({ where: { businessProfileId: bpId } }),
    prisma.campaign.count({ where: { businessProfileId: bpId, status: "OPEN" } }),
    prisma.campaign.count({ where: { businessProfileId: bpId, status: "ACTIVE" } }),
    prisma.campaign.count({ where: { businessProfileId: bpId, status: "DRAFT" } }),
  ]);
  const activeCollabs = await prisma.collaboration.count({
    where: { businessProfileId: bpId, status: "ACTIVE" },
  });

  const ctx = {
    role: "BUSINESS",
    companyName: user.businessProfile.companyName,
    campaigns: { total: all, open: open, active: active, draft: draft },
    activeCollaborations: activeCollabs,
  };

  if (campaignId) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, businessProfileId: bpId },
      select: { id: true, title: true, category: true, location: true, status: true },
    });
    if (campaign) {
      await generateMatches(user, campaign.id);
      const [matches] = await getMatches(user, campaign.id, { limit: 5, minScore: 50 });
      ctx.campaignFocus = {
        ...campaign,
        topPromoters: matches.map((m) => ({
          username: m.promoter.username,
          niche: m.promoter.niche,
          location: m.promoter.location,
          followersCount: m.promoter.followersCount,
          verified: m.promoter.verified,
          score: m.score,
          classification: m.classification,
          explanation: m.explanation,
        })),
      };
    }
  }
  return ctx;
}

async function buildPromoterContext(user) {
  if (!user.promoterProfile) return null;
  const [openCount, activeCollabs, totalReviews, avgRating] = await Promise.all([
    prisma.campaign.count({ where: { status: "OPEN", visibility: "PUBLIC" } }),
    prisma.collaboration.count({ where: { promoterProfileId: user.promoterProfile.id, status: "ACTIVE" } }),
    prisma.review.count({ where: { revieweeId: user.id } }),
    prisma.review.aggregate({ where: { revieweeId: user.id }, _avg: { rating: true } }),
  ]);

  const [campaigns] = await listMarketplaceCampaigns(user, { limit: 5, sort: "createdAt" });
  const ctx = {
    role: "PROMOTER",
    username: user.promoterProfile.username,
    niche: user.promoterProfile.niche,
    openCampaignsAvailable: openCount,
    activeCollaborations: activeCollabs,
    reviewsReceived: totalReviews,
    averageRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : 0,
    suggestedCampaigns: campaigns.map((c) => ({
      title: c.title,
      category: c.category,
      budget: c.budget,
      location: c.location,
      businessName: c.businessName,
      applicantCount: c.applicantCount,
      hasApplied: c.hasApplied,
    })),
  };
  return ctx;
}

async function buildAdminContext() {
  const [users, businesses, promoters, campaigns, activeCampaigns] = await Promise.all([
    prisma.user.count(),
    prisma.businessProfile.count(),
    prisma.promoterProfile.count(),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
  ]);
  return {
    role: "ADMIN",
    totals: {
      users,
      businesses,
      promoters,
      campaigns,
      activeCampaigns,
    },
  };
}

export async function buildAssistantContext(user, campaignId) {
  try {
    if (user.role === "BUSINESS") return await buildBusinessContext(user, campaignId);
    if (user.role === "PROMOTER") return await buildPromoterContext(user);
    if (user.role === "ADMIN") return await buildAdminContext();
  } catch {
    return null;
  }
  return null;
}

const contextBlock = (ctx) =>
  ctx
    ? `\n\nLIVE ACCOUNT DATA (use this to answer account-specific questions; never invent numbers not shown here):\n${JSON.stringify(ctx, null, 2)}`
    : "";

export const chatWithAssistant = async ({ message, role, history = [], user, campaignId }) => {
  const ctx = user ? await buildAssistantContext(user, campaignId) : null;
  const groq = getGroqClient();
  const messages = [
    {
      role: "system",
      content: `${rolePrompt(role)}\n\nPlatform reference:\n${PLATFORM_KNOWLEDGE}\n\n${GUARDRAILS}\n\nWhen LIVE ACCOUNT DATA is provided, ground every account-specific answer in it (campaign counts, matches, suggestions). If the user asks about a specific campaign's promoters, reference the topPromoters list. If data is missing for what they ask, say so and point them to the right page.${contextBlock(ctx)}\n\nKeep answers friendly, concise, and actionable.`,
    },
    ...history.slice(-10).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
    { role: "user", content: message },
  ];
  const response = await groq.chat.completions.create({
    messages,
    model: "llama-3.3-70b-versatile",
    temperature: 0.6,
    max_tokens: 700,
  });
  return { text: response.choices[0]?.message?.content || "", role: role || null };
};

const generateText = async (system, user) => {
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 800,
  });
  return { text: response.choices[0]?.message?.content || "" };
};

export const generateCampaignDescription = (prompt) =>
  generateText(
    `You are a senior copywriter for ${PLATFORM_NAME}, a brand-to-promoter marketing platform. Write a clear, compelling campaign description (2-4 short paragraphs) based on the user's brief. Focus on goals, audience, deliverables, and tone. No preamble, no headings.`,
    prompt
  );

export const generateProposalMessage = (campaignDescription, promoterBackground) =>
  generateText(
    `You are a promoter on ${PLATFORM_NAME} writing a personalized proposal message to a business whose campaign is described. Be concise, confident, and specific about fit. No preamble.`,
    `Campaign:\n${campaignDescription}\n\nMy background:\n${promoterBackground}`
  );

export const generateSocialContent = (topic, platform) =>
  generateText(
    `You are a social media expert on ${PLATFORM_NAME}. Create engaging ${platform} content (caption + 3-5 hashtags) about the given topic. Match ${platform} tone. No preamble.`,
    `Topic: ${topic}\nPlatform: ${platform}`
  );
