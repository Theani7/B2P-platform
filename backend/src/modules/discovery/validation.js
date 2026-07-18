import { z } from "zod";

export const directoryQuerySchema = z.object({
  search: z.string().optional(),
  niche: z.string().optional(),
  location: z.string().optional(),
  verified: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  followersMin: z.coerce.number().int().min(0).optional(),
  followersMax: z.coerce.number().int().min(0).optional(),
  experienceMin: z.coerce.number().int().min(0).optional(),
  experienceMax: z.coerce.number().int().min(0).optional(),
  sortBy: z.enum(["newest", "followers_count", "engagement_rate", "years_experience", "username"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const savedQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
