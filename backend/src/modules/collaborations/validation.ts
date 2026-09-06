import { z } from "zod";

export const deliverableCreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters"),
  description: z.string().trim().max(1000, "Description must be at most 1000 characters").optional(),
  contentUrl: z.string().url("Must be a valid URL").min(1),
});

export const deliverableReviewSchema = z.object({
  status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "REVISION_REQUESTED", "PUBLISHED"]),
  feedback: z.string().optional(),
});

export const collaborationListQuerySchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
