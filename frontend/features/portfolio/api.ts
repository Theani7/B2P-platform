import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface PortfolioMedia {
  id: string;
  portfolioItemId: string;
  filePath: string;
  mediaType: string;
  displayOrder: number;
}

export interface PortfolioItem {
  id: string;
  promoterProfileId: string;
  title: string;
  clientName?: string | null;
  campaignType?: string | null;
  description?: string | null;
  coverImage?: string | null;
  featured: boolean;
  platforms?: string[];
  tags?: string[];
  media?: PortfolioMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItemInput {
  title: string;
  clientName?: string;
  campaignType?: string;
  description?: string;
  coverImage?: string;
  featured?: boolean;
  platforms?: string[];
  tags?: string[];
}

export const getMyPortfolio = async (): Promise<PortfolioItem[]> =>
  api.get<PortfolioItem[]>("/portfolio/").then((r) => r.data);

export const useMyPortfolio = () =>
  useQuery<PortfolioItem[]>({
    queryKey: ["my-portfolio"],
    queryFn: getMyPortfolio,
  });

export const useCreatePortfolioItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PortfolioItemInput) => api.post<PortfolioItem>("/portfolio/", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-portfolio"] });
      qc.invalidateQueries({ queryKey: ["profile-completion"] });
    },
  });
};

export const useUpdatePortfolioItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PortfolioItemInput> }) =>
      api.patch<PortfolioItem>(`/portfolio/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-portfolio"] });
      qc.invalidateQueries({ queryKey: ["profile-completion"] });
    },
  });
};

export const useDeletePortfolioItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/portfolio/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-portfolio"] });
      qc.invalidateQueries({ queryKey: ["profile-completion"] });
    },
  });
};

export interface PortfolioMediaInput {
  filePath: string;
  mediaType?: string;
}

export const getPortfolioMedia = async (itemId: string): Promise<PortfolioMedia[]> =>
  api.get<PortfolioMedia[]>(`/portfolio/${itemId}/media`).then((r) => r.data);

export const usePortfolioMedia = (itemId: string) =>
  useQuery<PortfolioMedia[]>({
    queryKey: ["portfolio-media", itemId],
    queryFn: () => getPortfolioMedia(itemId),
    enabled: !!itemId,
  });

export const useAddPortfolioMedia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, filePath, mediaType }: { itemId: string; filePath: string; mediaType?: string }) =>
      api.post<PortfolioMedia>(`/portfolio/${itemId}/media`, { filePath, mediaType }).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["my-portfolio"] });
      qc.invalidateQueries({ queryKey: ["portfolio-media", vars.itemId] });
    },
  });
};

export const useDeletePortfolioMedia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, mediaId }: { itemId: string; mediaId: string }) =>
      api.delete(`/portfolio/${itemId}/media/${mediaId}`).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["my-portfolio"] });
      qc.invalidateQueries({ queryKey: ["portfolio-media", vars.itemId] });
    },
  });
};

export const useViewPortfolio = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/portfolio/${id}/view`).then((r) => r.data),
    onSuccess: () => {
      // Don't aggressively invalidate to prevent UI jumps while viewing
    }
  });
};

export const useLikePortfolio = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/portfolio/${id}/like`).then((r) => r.data),
    onSuccess: (data, id) => {
      // Optimistically update the like status for this item
      qc.setQueryData(["portfolio-like-status", id], { hasLiked: data.hasLiked });
      
      qc.invalidateQueries({ queryKey: ["promoter"] });
      qc.invalidateQueries({ queryKey: ["my-portfolio"] });
    }
  });
};

export const usePortfolioLikeStatus = (itemId: string | undefined, enabled = true) =>
  useQuery<{ hasLiked: boolean }>({
    queryKey: ["portfolio-like-status", itemId],
    queryFn: () => api.get(`/portfolio/${itemId}/like`).then(r => r.data),
    enabled: !!itemId && enabled,
    retry: false, // Don't retry on 401
  });

