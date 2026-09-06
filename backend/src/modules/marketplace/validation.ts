import { z } from "zod";

export const marketplaceListQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.enum(["createdAt", "budget", "startDate", "endDate", "title"]).optional(),
});
