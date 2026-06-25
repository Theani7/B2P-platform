import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatKeys, getConversations, getConversationHistory, markConversationRead } from "./api";

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: getConversations,
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
