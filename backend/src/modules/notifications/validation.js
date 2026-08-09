import { z } from "zod";

const stringToBoolean = z.union([z.boolean(), z.enum(["true", "false"])]).transform((val) => val === true || val === "true");

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  unread_only: stringToBoolean.optional().default(false),
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
