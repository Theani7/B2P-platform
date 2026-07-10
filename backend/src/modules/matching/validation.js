import { z } from "zod";

export const matchesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  classification: z.enum(["EXCELLENT_MATCH", "GOOD_MATCH", "AVERAGE_MATCH", "LOW_MATCH"]).optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  verified: z.enum(["true", "false"]).optional().transform((v) => (v === undefined ? undefined : v === "true")),
});
