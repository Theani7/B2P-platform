import { z } from "zod";

const isoDate = z.coerce.date();

export const campaignCreateSchema = z
  .object({
    title: z.string().min(1).max(255),
    description: z.string().min(20).max(5000),
    category: z.string().max(100),
    budget: z.coerce.number().gt(0).max(1000000000),
    location: z.string().max(255),
    targetAudience: z.string().max(5000).optional(),
    requirements: z.string().max(5000).optional(),
    startDate: isoDate,
    endDate: isoDate,
    visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
    status: z.enum(["DRAFT", "OPEN"]).optional(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const campaignUpdateSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().min(20).max(5000).optional(),
    category: z.string().max(100).optional(),
    budget: z.coerce.number().gt(0).max(1000000000).optional(),
    location: z.string().max(255).optional(),
    targetAudience: z.string().max(5000).optional(),
    requirements: z.string().max(5000).optional(),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
    status: z.enum(["DRAFT", "OPEN", "ACTIVE", "COMPLETED", "ARCHIVED", "CANCELLED"]).optional(),
  })
  .refine(
    (d) => !(d.startDate && d.endDate) || d.endDate >= d.startDate,
    { message: "End date must be on or after start date", path: ["endDate"] }
  );

export const campaignListQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "OPEN", "ACTIVE", "COMPLETED", "ARCHIVED", "CANCELLED"]).optional(),
  location: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.enum(["createdAt", "budget", "startDate", "endDate", "title"]).optional(),
});
