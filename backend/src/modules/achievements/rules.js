import { prisma } from "../../config/db.js";
import { ROLE } from "../../shared/enums.js";

/**
 * Rule engine: evaluates achievement progress for a user.
 * Returns [{ key, progress }] entries (progress 0..100).
 * `user` must include promoterProfile and businessProfile relations.
 */
export async function evaluateAll(user) {
  const earned = [];

  if (user.role === ROLE.PROMOTER) {
    earned.push(...(await evaluatePromoterRules(user)));
  }

  earned.push(...(await evaluateGeneralRules(user)));
  return earned;
}

async function evaluateGeneralRules(user) {
  const earned = [];
  if (user.role === ROLE.PROMOTER && user.promoterProfile) {
    earned.push({ key: "COMPLETE_PROFILE", progress: 100 });
  } else if (user.role === ROLE.BUSINESS && user.businessProfile) {
    earned.push({ key: "COMPLETE_BUSINESS_PROFILE", progress: 100 });
  }

  const socialLinks = await prisma.socialLink.count({ where: { userId: user.id } });
  if (socialLinks > 0) {
    earned.push({ key: "FIRST_SOCIAL_LINK", progress: 100 });
  }
  return earned;
}

async function evaluatePromoterRules(user) {
  const earned = [];
  if (user.promoterProfile) {
    const portfolios = await prisma.portfolioItem.count({
      where: { promoterId: user.promoterProfile.id },
    });
    if (portfolios > 0) {
      earned.push({ key: "FIRST_PORTFOLIO", progress: 100 });
    }
  }
  return earned;
}
