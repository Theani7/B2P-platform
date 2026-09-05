import { z } from "zod";

export const SOCIAL_PLATFORMS = ["INSTAGRAM", "TIKTOK", "YOUTUBE", "FACEBOOK", "X", "LINKEDIN"];

const platformField = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(z.enum(SOCIAL_PLATFORMS));

export const socialLinkCreateSchema = z
  .object({
    platform: platformField,
    username: z.string().trim().max(255).optional(),
    url: z.string().url().max(500).optional(),
    followersCount: z.coerce.number().int().min(0).optional(),
  })
  .refine((v) => v.username || v.url, { message: "Provide a username or a URL" });

export const socialLinkUpdateSchema = z.object({
  platform: platformField.optional(),
  username: z.string().trim().max(255).optional(),
  url: z.string().url().max(500).optional(),
  followersCount: z.coerce.number().int().min(0).optional(),
});
