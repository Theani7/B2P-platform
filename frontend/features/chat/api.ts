import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface ChatParticipant {
  id: string;
  name: string;
  avatar: string;
  role: "BUSINESS" | "PROMOTER";
}

export interface LastMessage {
  id: string;
  senderId: string;
  message: string;
  messageType?: string;
  isDeleted?: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  collaborationId: string;
  participants: ChatParticipant[];
  unreadCount: number;
  lastMessage: LastMessage | null;
  collaborationStatus: string;
  campaignTitle: string | null;
  campaignBudget: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderAvatar?: string | null;
  message: string;
  messageType?: string;
  editedAt?: string | null;
  readAt?: string | null;
  isDeleted?: boolean;
  createdAt: string;
}

export interface HistoryRead {
  items: ChatMessage[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const useConversations = () =>
  useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: () => api.get<{ items: Conversation[] }>("/chat/conversations").then((r) => r.data.items),
    refetchInterval: 15000,
  });

export const useChatHistory = (collaborationId: string) =>
  useQuery<HistoryRead>({
    queryKey: ["chat-history", collaborationId],
    queryFn: () =>
      api.get<HistoryRead>(`/chat/collaborations/${collaborationId}/history`).then((r) => r.data),
    enabled: !!collaborationId,
  });

export const useMarkConversationRead = () => {
  const qc = useQueryClient();
  return useMutation<{ updatedCount: number }, Error, string>({
    mutationFn: (conversationId) =>
      api.post(`/chat/conversations/${conversationId}/read`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
};

export const useEditMessage = () => {
  const qc = useQueryClient();
  return useMutation<ChatMessage, Error, { messageId: string; content: string }>({
    mutationFn: ({ messageId, content }) =>
      api.patch(`/chat/messages/${messageId}`, { content }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
};

export const useDeleteMessage = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (messageId) => api.delete(`/chat/messages/${messageId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
};
