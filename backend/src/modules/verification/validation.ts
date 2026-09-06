import { z } from "zod";

export const submitVerificationSchema = z.object({
  documentUrl: z.string().max(1000).optional(),
  documentName: z.string().max(255).optional(),
});

export const reviewSchema = z.object({
  adminNotes: z.string().max(2000).optional(),
});

export const listQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
