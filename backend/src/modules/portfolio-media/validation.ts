import { z } from "zod";

export const mediaOrderSchema = z.object({
  displayOrder: z.number().int().min(0).optional(),
});
