import { z } from "zod";

export const portfolioItemCreateSchema = z.object({
  title: z.string().min(1).max(255),
  clientName: z.string().max(255).optional(),
  campaignType: z.string().max(100).optional(),
  description: z.string().optional(),
  coverImage: z.string().max(500).optional(),
  featured: z.boolean().optional(),
  platforms: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const portfolioItemUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  clientName: z.string().max(255).optional(),
  campaignType: z.string().max(100).optional(),
  description: z.string().optional(),
  coverImage: z.string().max(500).optional(),
  featured: z.boolean().optional(),
  platforms: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});
