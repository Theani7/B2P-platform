import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface ReviewRead {
  id: string;
  collaborationId: string;
  reviewer: { id: string; username: string; fullName?: string; avatarUrl?: string | null } | null;
  revieweeId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  businessName: string;
  campaignTitle: string;
}

export interface ReviewListRead {
  items: ReviewRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

export interface ReviewInput {
  rating: number;
  comment?: string;
}

const invalidateReviews = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["my-reviews"] });
  qc.invalidateQueries({ queryKey: ["received-reviews"] });
  qc.invalidateQueries({ queryKey: ["business-collaborations"] });
  qc.invalidateQueries({ queryKey: ["promoter-collaborations"] });
};

export const useCompleteCollaboration = () => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (collaborationId) =>
      api.post(`/collaborations/${collaborationId}/complete`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business-collaborations"] });
      qc.invalidateQueries({ queryKey: ["promoter-collaborations"] });
    },
  });
};

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation<ReviewRead, Error, { collaborationId: string; data: ReviewInput }>({
    mutationFn: ({ collaborationId, data }) =>
      api.post(`/collaborations/${collaborationId}/reviews`, data).then((r) => r.data),
    onSuccess: () => invalidateReviews(qc),
  });
};

export const useUpdateReview = () => {
  const qc = useQueryClient();
  return useMutation<ReviewRead, Error, { reviewId: string; data: ReviewInput }>({
    mutationFn: ({ reviewId, data }) => api.put(`/reviews/${reviewId}`, data).then((r) => r.data),
    onSuccess: () => invalidateReviews(qc),
  });
};

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (reviewId) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => invalidateReviews(qc),
  });
};

export const useMyReviews = (params?: { page?: number; limit?: number }) =>
  useQuery<ReviewListRead>({
    queryKey: ["my-reviews", params],
    queryFn: () => api.get<ReviewListRead>("/my/reviews", { params }).then((r) => r.data),
  });

export const useReceivedReviews = (params?: { page?: number; limit?: number }) =>
  useQuery<ReviewListRead>({
    queryKey: ["received-reviews", params],
    queryFn: () => api.get<ReviewListRead>("/my/received-reviews", { params }).then((r) => r.data),
  });

export const useUserReviews = (userId: string, params?: { page?: number; limit?: number }) =>
  useQuery<ReviewListRead>({
    queryKey: ["user-reviews", userId, params],
    queryFn: () => api.get<ReviewListRead>(`/users/${userId}/reviews`, { params }).then((r) => r.data),
    enabled: !!userId,
  });

export const useUserRating = (userId: string) =>
  useQuery<RatingSummary>({
    queryKey: ["user-rating", userId],
    queryFn: () => api.get<RatingSummary>(`/users/${userId}/rating`).then((r) => r.data),
    enabled: !!userId,
  });
