import { z } from "zod";

const nichesField = z.array(z.string().min(1).max(50)).min(1).max(3).optional();

export const promoterProfileCreateSchema = z.object({
  username: z.string().min(3).max(150).regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, numbers, underscores, and hyphens"),
  headline: z.string().max(255).optional(),
  bio: z.string().optional(),
  niche: z.string(),
  niches: nichesField,
  location: z.string().max(255).optional(),
  avatarUrl: z.string().max(500).optional(),
  followersCount: z.coerce.number().int().min(0).max(1000000000).optional(),
  engagementRate: z.coerce.number().min(0).max(100).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
});

export const promoterProfileUpdateSchema = z.object({
  username: z.string().min(3).max(150).regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, numbers, underscores, and hyphens").optional(),
  headline: z.string().max(255).optional(),
  bio: z.string().optional(),
  niche: z.string().optional(),
  niches: nichesField,
  location: z.string().max(255).optional(),
  avatarUrl: z.string().max(500).optional(),
  followersCount: z.coerce.number().int().min(0).max(1000000000).optional(),
  engagementRate: z.coerce.number().min(0).max(100).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
});
