import { z } from "zod";

export const inviteSchema = z.object({
  message: z.string().max(2000).optional(),
});

export const listQuerySchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
