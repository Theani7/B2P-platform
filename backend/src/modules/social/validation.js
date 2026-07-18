import { z } from "zod";

export const socialLinkCreateSchema = z.object({
  platform: z.string().min(1).max(50),
  username: z.string().max(255).optional(),
  url: z.string().url().max(500),
  followersCount: z.coerce.number().int().min(0).optional(),
});

export const socialLinkUpdateSchema = z.object({
  platform: z.string().min(1).max(50).optional(),
  username: z.string().max(255).optional(),
  url: z.string().url().max(500).optional(),
  followersCount: z.coerce.number().int().min(0).optional(),
});
