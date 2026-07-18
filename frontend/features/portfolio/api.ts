import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-portfolio"] }),
  });
};

export const useUpdatePortfolioItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PortfolioItemInput> }) =>
      api.patch<PortfolioItem>(`/portfolio/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-portfolio"] }),
  });
};

export const useDeletePortfolioItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/portfolio/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-portfolio"] }),
  });
};
