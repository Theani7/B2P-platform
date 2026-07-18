import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { ROLE } from "../../shared/enums.js";

function score(checks) {
  const total = checks.length;
  const done = checks.filter((c) => c.pass).length;
  const missing = checks.filter((c) => !c.pass).map((c) => c.label);
  const completion = total === 0 ? 100 : Math.round((done / total) * 100);
  return { completion, completed: done, total, missing };
}

async function promoterCompletion(user) {
  const profile = await prisma.promoterProfile.findUnique({
    where: { userId: user.id },
    include: { portfolioItems: true, user: { include: { socialLinks: true } } },
  });
  if (!profile) throw new AppError("Promoter profile not found", 404);

  const checks = [
    { label: "headline", pass: !!profile.headline },
    { label: "bio", pass: !!profile.bio },
    { label: "niche", pass: !!profile.niche },
    { label: "location", pass: !!profile.location },
    { label: "avatar", pass: !!profile.avatarUrl },
    { label: "portfolio", pass: profile.portfolioItems.length > 0 },
    { label: "social_links", pass: profile.user.socialLinks.length > 0 },
    { label: "verification", pass: !!profile.verified },
  ];
  return { type: "PROMOTER", ...score(checks) };
}

async function businessCompletion(user) {
  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new AppError("Business profile not found", 404);

  const checks = [
    { label: "company_name", pass: !!profile.companyName },
    { label: "industry", pass: !!profile.industry },
    { label: "description", pass: !!profile.description },
    { label: "location", pass: !!profile.location },
    { label: "website", pass: !!profile.website },
    { label: "logo", pass: !!profile.logoUrl },
    { label: "verification", pass: !!profile.verified },
  ];
  return { type: "BUSINESS", ...score(checks) };
}

export async function getCompletion(user) {
  if (user.role === ROLE.PROMOTER) return promoterCompletion(user);
  if (user.role === ROLE.BUSINESS) return businessCompletion(user);
  throw new AppError("Completion scoring is only available for BUSINESS/PROMOTER profiles", 403);
}
