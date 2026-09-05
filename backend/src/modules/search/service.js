import { prisma } from "../../config/db.js";
import { ROLE } from "../../shared/enums.js";

function scoreResults(items, q) {
  const ql = q.toLowerCase();
  for (const item of items) {
    const title = (item.title || "").toLowerCase();
    let score = 0;
    if (ql === title) score += 100;
    else if (title.startsWith(ql)) score += 50;
    else if (title.includes(ql)) score += 25;
    const subtitle = (item.subtitle || "").toLowerCase();
    if (subtitle && subtitle.includes(ql)) score += 10;
    item.score = score;
  }
  items.sort((a, b) => b.score - a.score);
  return items;
}

function recordHistory(userId, q) {
  prisma.searchHistory.count({ where: { userId } }).then((count) => {
    if (count >= 10) {
      return prisma.searchHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }).then((oldest) => {
        if (oldest) return prisma.searchHistory.delete({ where: { id: oldest.id } });
      });
    }
  }).then(() => {
    return prisma.searchHistory.create({ data: { userId, query: q } });
  }).catch(() => {});
}

export async function performSearch(user, { q, type, limit = 10, page = 1 }) {
  recordHistory(user.id, q);

  const results = {
    campaigns: [],
    promoters: [],
    businesses: [],
    collaborations: [],
    messages: [],
    users: [],
  };

  if (!type || type === "campaign") {
    const camps = await prisma.campaign.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { businessProfile: true },
      skip: (Number(page) - 1) * Number(limit),
      take: limit,
    });
    for (const c of camps) {
      if (
        user.role === ROLE.ADMIN ||
        (c.status === "OPEN" && c.visibility === "PUBLIC") ||
        c.businessProfileId === user.businessProfile?.id
      ) {
        results.campaigns.push({
          id: c.id,
          title: c.title,
          subtitle: c.status,
          imageUrl: null,
          type: "campaign",
          url:
            user.role === ROLE.BUSINESS
              ? `/business/campaigns/${c.id}`
              : `/promoter/marketplace?campaignId=${c.id}`,
          score: 0,
        });
      }
    }
  }

  if (!type || type === "promoter") {
    const proms = await prisma.promoterProfile.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { headline: { contains: q, mode: "insensitive" } },
          { niche: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
    });
    for (const p of proms) {
      results.promoters.push({
        id: p.id,
        title: p.username,
        subtitle: p.niche,
        imageUrl: p.avatarUrl,
        type: "promoter",
        url: `/u/${p.username}`,
        score: 0,
      });
    }
  }

  if (!type || type === "business") {
    const bizes = await prisma.businessProfile.findMany({
      where: {
        OR: [
          { companyName: { contains: q, mode: "insensitive" } },
          { industry: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
    });
    for (const b of bizes) {
      results.businesses.push({
        id: b.id,
        title: b.companyName,
        subtitle: b.industry,
        imageUrl: b.logoUrl,
        type: "business",
        url: `/search?q=${encodeURIComponent(b.companyName)}`,
        score: 0,
      });
    }
  }

  if (user.role === ROLE.ADMIN && (!type || type === "user")) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
    });
    for (const u of users) {
      results.users.push({
        id: u.id,
        title: u.fullName || u.email,
        subtitle: u.role,
        type: "user",
        url: `/admin/users/${u.id}`,
        score: 0,
      });
    }
  }

  for (const key of Object.keys(results)) {
    if (results[key].length) results[key] = scoreResults(results[key], q);
  }

  return results;
}

export async function getHistory(user) {
  return prisma.searchHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function clearHistory(user) {
  await prisma.searchHistory.deleteMany({ where: { userId: user.id } });
  return { success: true };
}
