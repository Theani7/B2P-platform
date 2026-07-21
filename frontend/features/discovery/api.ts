import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface PromoterDirectoryItem {
  id: string;
  userId: string;
  username: string;
  headline?: string | null;
  niche: string;
  location?: string | null;
  avatarUrl?: string | null;
  followersCount: number;
  engagementRate: number;
  yearsExperience?: number | null;
  verified: boolean;
  averageRating?: number;
}

export interface PromoterDirectoryResponse {
  items: PromoterDirectoryItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PortfolioItemRead {
  id: string;
  title: string;
  clientName?: string | null;
  campaignType?: string | null;
  description?: string | null;
  coverImage?: string | null;
  featured: boolean;
  platforms?: string[];
  tags?: string[];
  media?: Array<{
    id: string;
    filePath: string;
    mediaType: string;
    displayOrder: number;
  }>;
}

export interface SocialLinkRead {
  id: string;
  platform: string;
  username?: string | null;
  url: string;
  followersCount?: number | null;
}

export interface PromoterPublicProfile {
  id: string;
  userId: string;
  username: string;
  headline?: string | null;
  bio?: string | null;
  niche: string;
  location?: string | null;
  avatarUrl?: string | null;
  followersCount: number;
  engagementRate: number;
  yearsExperience?: number | null;
  verified: boolean;
  averageRating?: number;
  portfolioItems: PortfolioItemRead[];
  socialLinks: SocialLinkRead[];
}

export interface SavedPromoterRead {
  id: string;
  businessProfileId: string;
  promoterProfileId: string;
  promoter: PromoterDirectoryItem;
}

export interface DirectorySearchParams {
  search?: string;
  niche?: string;
  location?: string;
  verified?: boolean;
  followersMin?: number;
  followersMax?: number;
  experienceMin?: number;
  experienceMax?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export const usePromoterDirectory = (params: DirectorySearchParams) =>
  useQuery<PromoterDirectoryResponse>({
    queryKey: ["promoter-directory", params],
    queryFn: () => api.get("/promoters", { params }).then((r) => r.data),
  });

export const usePublicPromoterProfile = (username: string) =>
  useQuery<PromoterPublicProfile>({
    queryKey: ["promoter", username],
    queryFn: () => api.get(`/promoters/${username}`).then((r) => r.data),
    enabled: !!username,
  });

export const useSavePromoter = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (promoterId) => api.post(`/business/saved-promoters/${promoterId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-promoters"] });
      qc.invalidateQueries({ queryKey: ["promoter-directory"] });
    },
  });
};

export const useRemoveSavedPromoter = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (promoterId) => api.delete(`/business/saved-promoters/${promoterId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-promoters"] });
      qc.invalidateQueries({ queryKey: ["promoter-directory"] });
    },
  });
};

export const useSavedPromoters = (params: { search?: string; page?: number; limit?: number }) =>
  useQuery<PromoterDirectoryResponse>({
    queryKey: ["saved-promoters", params],
    queryFn: () => api.get("/business/saved-promoters", { params }).then((r) => r.data),
  });
