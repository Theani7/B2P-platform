import { z } from "zod";

const password = z.string().min(6);

export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(150)
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
  fullName: z.string().max(255),
  email: z.string().email(),
  password,
  role: z.enum(["BUSINESS", "PROMOTER"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const refreshSchema = z.object({
  refresh_token: z.string(),
});

export const verifyEmailSchema = z.object({
  token: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  new_password: z.string().min(6),
});

export const updateMeSchema = z.object({
  fullName: z.string().max(255).optional(),
  email: z.string().email().optional(),
});

export const checkSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
});
