import { z } from "zod";

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  unread_only: z.coerce.boolean().optional(),
});

export const preferenceUpdateSchema = z.object({
  preferences: z
    .array(
      z.object({
        type: z.string().min(1),
        enabled: z.boolean(),
      })
    )
    .min(1),
});
