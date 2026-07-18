import { z } from "zod";

export const editMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const messageSendSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().min(1).max(5000),
  messageType: z.enum(["TEXT", "IMAGE"]).optional(),
});
