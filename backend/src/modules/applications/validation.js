import { z } from "zod";

export const applySchema = z.object({
  message: z.string().max(2000).optional(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
