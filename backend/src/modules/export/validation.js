import { z } from "zod";

export const exportRequestSchema = z.object({
  module: z.enum(["campaigns", "promoters", "profile"]),
  format: z.enum(["csv", "json"]).default("csv"),
  columns: z.array(z.string()).optional(),
});
