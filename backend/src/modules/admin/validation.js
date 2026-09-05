import { z } from "zod";

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  role: z.enum(["BUSINESS", "PROMOTER", "ADMIN"]).optional(),
  // Query strings arrive as text, so Boolean("false") would wrongly coerce to
  // true — accept explicit "true"/"false" strings instead.
  isActive: z
    .union([z.enum(["true", "false"]), z.boolean()])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .optional(),
  sort: z.enum(["newest", "oldest", "name", "role"]).optional(),
});

export const adminCampaignQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
});

export const adminReviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const settingUpdateSchema = z.object({
  settingValue: z.string(),
  description: z.string().optional(),
});
