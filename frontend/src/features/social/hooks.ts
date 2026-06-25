import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  socialKeys,
  getMySocialLinks,
  getUserSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
} from "./api";
import { notifyError } from "../../hooks/useToast";

export function useMySocialLinks() {
  return useQuery({
    queryKey: socialKeys.me(),
    queryFn: getMySocialLinks,
  });
}

export function useUserSocialLinks(userId: string) {
  return useQuery({
    queryKey: socialKeys.user(userId),
    queryFn: () => getUserSocialLinks(userId),
    enabled: !!userId,
  });
}

export function useCreateSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.me() });
      queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
    },
    onError: (err: any) => notifyError(err.response?.data?.detail || "Failed to add social link"),
  });
}

export function useUpdateSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.me() });
    },
    onError: (err: any) => notifyError(err.response?.data?.detail || "Failed to update social link"),
  });
}

export function useDeleteSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.me() });
      queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
    },
    onError: (err: any) => notifyError(err.response?.data?.detail || "Failed to delete social link"),
  });
}

export function useReorderSocialLinks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderSocialLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.me() });
    },
    onError: (err: any) => notifyError(err.response?.data?.detail || "Failed to reorder social links"),
  });
}
