import { z } from "zod";

export const reviewCreateSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const reviewUpdateSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().max(1000).optional(),
  })
  .refine((d) => d.rating !== undefined || d.comment !== undefined, {
    message: "Provide at least one of rating or comment",
  });

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
