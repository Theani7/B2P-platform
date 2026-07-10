import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().min(1),
  type: z.enum(["campaign", "promoter", "business", "user"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
