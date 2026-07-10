import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/apiClient";
import type { ReviewListResponse, RatingSummary, ReviewRead, ReceivedReviewListResponse } from "./types";

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation<ReviewRead, Error, { collaborationId: string; rating: number; comment?: string }>({
    mutationFn: async ({ collaborationId, ...body }) => {
      const res = await api.post(`/collaborations/${collaborationId}/reviews`, body);
      return res.data;
    },
onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
      qc.invalidateQueries({ queryKey: ["my-received-reviews"] });
      qc.invalidateQueries({ queryKey: ["user-rating"] });
    },
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation<ReviewRead, Error, { reviewId: string; rating?: number; comment?: string }>({
    mutationFn: async ({ reviewId, ...body }) => {
      const res = await api.put(`/reviews/${reviewId}`, body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
      qc.invalidateQueries({ queryKey: ["my-received-reviews"] });
      qc.invalidateQueries({ queryKey: ["user-rating"] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (reviewId) => {
      await api.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

export function useMyReviews(params?: { page?: number; limit?: number }) {
  return useQuery<ReviewListResponse>({
    queryKey: ["my-reviews", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      const res = await api.get(`/my/reviews${qs.toString() ? `?${qs.toString()}` : ""}`);
      return res.data;
    },
  });
}

export function useMyReceivedReviews(params?: { page?: number; limit?: number }) {
  return useQuery<ReceivedReviewListResponse>({
    queryKey: ["my-received-reviews", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      const res = await api.get(`/my/received-reviews${qs.toString() ? `?${qs.toString()}` : ""}`);
      return res.data;
    },
  });
}

export function useUserReviews(userId: string, params?: { page?: number; limit?: number }) {
  return useQuery<ReviewListResponse>({
    queryKey: ["user-reviews", userId, params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      const res = await api.get(`/users/${userId}/reviews${qs.toString() ? `?${qs.toString()}` : ""}`);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useUserRating(userId: string) {
  return useQuery<RatingSummary>({
    queryKey: ["user-rating", userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}/rating`);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useCompleteCollaboration() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: async (collaborationId) => {
      const res = await api.post(`/collaborations/${collaborationId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business-collaborations"] });
      qc.invalidateQueries({ queryKey: ["promoter-collaborations"] });
    },
  });
}
