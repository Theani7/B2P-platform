import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatKeys, getConversations, getConversationHistory, markConversationRead } from "./api";

export function useConversations(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...chatKeys.conversations(), page, limit],
    queryFn: () => getConversations(page, limit),
  });
}

export function useConversationHistory(collaborationId: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(collaborationId),
    queryFn: ({ pageParam = 1 }) => getConversationHistory(collaborationId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.next_page,
    enabled: !!collaborationId,
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markConversationRead,
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string, content: string }) => 
      import('./api').then(m => m.editMessage(messageId, content)),
    onSuccess: () => {
      // Invalidate messages for this conversation to reflect the change
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
    },
  });
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => import('./api').then(m => m.deleteMessage(messageId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
    },
  });
}
