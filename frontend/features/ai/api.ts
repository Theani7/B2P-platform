import { useMutation } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantMessage {
  message: string;
  role?: string | null;
  campaignId?: string;
  history?: ChatHistoryItem[];
}

export function useAssistantChat() {
  return useMutation({
    mutationFn: async (payload: AssistantMessage) =>
      (await api.post<{ text: string; role: string | null }>("/ai/chat", payload)).data,
  });
}
