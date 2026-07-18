import { config } from "../../config/env.js";
import { z } from "zod";
import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";

export const campaignShareParamsSchema = z.object({
  campaignId: z.string().min(1),
});

export function getProfileShare(user) {
  const base = config.frontendUrl;

  if (user.role === "PROMOTER" && user.promoterProfile) {
    const username = user.promoterProfile.username;
    return {
      publicUrl: `${base}/promoters/${username}`,
      qrCodeUrl: null,
      username,
      slug: username,
    };
  }

  if (user.role === "BUSINESS" && user.businessProfile) {
    const companyName = user.businessProfile.companyName;
    const slug =
      companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || user.id.slice(0, 8);
    return {
      publicUrl: `${base}/promoter/marketplace`,
      qrCodeUrl: null,
      username: companyName,
      slug,
    };
  }

  const slug = user.id.slice(0, 8);
  return {
    publicUrl: `${base}/promoter/marketplace`,
    qrCodeUrl: null,
    username: user.fullName || "User",
    slug,
  };
}

export async function getCampaignShare(user, campaignId) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new AppError("Campaign not found", 404);
  if (user.role !== "BUSINESS" || campaign.businessProfileId !== user.businessProfile?.id) {
    throw new AppError("You are not authorized to share this campaign", 403);
  }

  const base = config.frontendUrl;
  return {
    publicUrl: `${base}/campaign-marketplace/${campaignId}`,
    qrCodeUrl: null,
    campaignId,
    title: campaign.title,
  };
}
