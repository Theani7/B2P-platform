import { z } from "zod";

export const generateCampaignSchema = z.object({
  prompt: z.string().min(5).max(1000)
});

export const generateProposalSchema = z.object({
  campaignDescription: z.string().min(10),
  promoterBackground: z.string().min(10)
});

export const generateSocialSchema = z.object({
  topic: z.string().min(2),
  platform: z.enum(["instagram", "tiktok", "youtube", "twitter"]).default("instagram")
});

export const chatSchema = z.object({
  message: z.string().min(2),
  role: z.enum(["BUSINESS", "PROMOTER", "ADMIN"]).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .max(20)
    .optional(),
});
