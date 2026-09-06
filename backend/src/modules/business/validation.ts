import { z } from "zod";

export const businessProfileCreateSchema = z.object({
  companyName: z.string().max(255),
  industry: z.string().max(100),
  description: z.string().optional(),
  location: z.string().max(255).optional(),
  website: z.string().max(255).optional(),
  logoUrl: z.string().max(500).optional(),
  companySize: z.string().max(50).optional(),
});

export const businessProfileUpdateSchema = z.object({
  companyName: z.string().max(255).optional(),
  industry: z.string().max(100).optional(),
  description: z.string().optional(),
  location: z.string().max(255).optional(),
  website: z.string().max(255).optional(),
  logoUrl: z.string().max(500).optional(),
  companySize: z.string().max(50).optional(),
});
