import { z } from "zod";

export const followParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const followListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
