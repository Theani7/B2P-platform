import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  portfolioKeys, 
  getMyPortfolio, 
  getPublicPortfolio, 
  createPortfolioItem, 
  updatePortfolioItem, 
  deletePortfolioItem,
  uploadMedia,
  deleteMedia 
} from "./api";
import { notifyError } from "../../hooks/useToast";

export function useMyPortfolio() {
  return useQuery({
    queryKey: portfolioKeys.lists(),
    queryFn: getMyPortfolio,
  });
}

export function usePublicPortfolio(promoterId: string) {
  return useQuery({
    queryKey: portfolioKeys.list(promoterId),
    queryFn: () => getPublicPortfolio(promoterId),
    enabled: !!promoterId,
  });
}

export function useCreatePortfolioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPortfolioItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
    },
    onError: (err) => notifyError("Failed to create portfolio item"),
  });
}

export function useUpdatePortfolioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePortfolioItem,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.detail(variables.id) });
    },
    onError: (err) => notifyError("Failed to update portfolio item"),
  });
}

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePortfolioItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
    },
    onError: (err) => notifyError("Failed to delete portfolio item"),
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.detail(variables.id) });
    },
    onError: (err) => notifyError("Failed to upload media"),
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
    },
    onError: (err) => notifyError("Failed to delete media"),
  });
}
