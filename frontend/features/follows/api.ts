import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import { notifySuccess, notifyApiError } from "@/lib/notify";

export interface FollowStatus {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export interface FollowToggleResult {
  following: boolean;
  followersCount: number;
  followingCount: number;
}

export interface FollowUserItem {
  id: string;
  username: string;
  fullName?: string | null;
  role: string;
}

export interface FollowListResponse {
  items: FollowUserItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const useFollowStatus = (userId: string) =>
  useQuery<FollowStatus>({
    queryKey: ["follow-status", userId],
    queryFn: () => api.get(`/follows/${userId}/status`).then((r) => r.data),
    enabled: !!userId,
  });

export const useFollow = () => {
  const qc = useQueryClient();
  return useMutation<FollowToggleResult, Error, string>({
    mutationFn: (userId) => api.post(`/follows/${userId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-status"] });
      qc.invalidateQueries({ queryKey: ["followers"] });
      qc.invalidateQueries({ queryKey: ["following"] });
      notifySuccess("Followed");
    },
    onError: (err) => notifyApiError(err, "Failed to follow"),
  });
};

export const useUnfollow = () => {
  const qc = useQueryClient();
  return useMutation<FollowToggleResult, Error, string>({
    mutationFn: (userId) => api.delete(`/follows/${userId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-status"] });
      qc.invalidateQueries({ queryKey: ["followers"] });
      qc.invalidateQueries({ queryKey: ["following"] });
      notifySuccess("Unfollowed");
    },
    onError: (err) => notifyApiError(err, "Failed to unfollow"),
  });
};

export const useFollowers = (userId: string, page = 1, limit = 20) =>
  useQuery<FollowListResponse>({
    queryKey: ["followers", userId, page],
    queryFn: () =>
      api.get(`/follows/${userId}/followers`, { params: { page, limit } }).then((r) => r.data),
    enabled: !!userId,
  });

export const useFollowing = (userId: string, page = 1, limit = 20) =>
  useQuery<FollowListResponse>({
    queryKey: ["following", userId, page],
    queryFn: () =>
      api.get(`/follows/${userId}/following`, { params: { page, limit } }).then((r) => r.data),
    enabled: !!userId,
  });
