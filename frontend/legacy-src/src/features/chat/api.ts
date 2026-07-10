import apiClient from "../../services/apiClient";
import type { Conversation, Message } from "./types";

export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  messages: (conversationId: string) => [...chatKeys.all, "messages", conversationId] as const,
};

export const getConversations = async (page = 1, limit = 50) => {
  const { data } = await apiClient.get<{ items: Conversation[], total: number, page: number, pages: number, limit: number }>(
    `/chat/conversations?page=${page}&limit=${limit}`
  );
  return data;
};

export const getConversationHistory = async (collaborationId: string, page = 1, limit = 50) => {
  const { data } = await apiClient.get<{ messages: Message[], next_page: number | null }>(
    `/chat/collaborations/${collaborationId}/history?page=${page}&limit=${limit}`
  );
  return data;
};

export const markConversationRead = async (conversationId: string) => {
  await apiClient.post(`/chat/conversations/${conversationId}/read`);
};

export const editMessage = async (messageId: string, content: string) => {
  const { data } = await apiClient.patch<Message>(`/chat/messages/${messageId}?content=${encodeURIComponent(content)}`);
  return data;
};

export const deleteMessage = async (messageId: string) => {
  const { data } = await apiClient.delete<Message>(`/chat/messages/${messageId}`);
  return data;
};
