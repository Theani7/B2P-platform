import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import type {
  CampaignRead,
  CampaignCreatePayload,
  CampaignUpdatePayload,
  CampaignListRead,
  CampaignDashboardStats,
} from "./types";

export interface CampaignListParams {
  search?: string;
  status?: string;
  location?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const useCampaigns = (params?: CampaignListParams, options?: { enabled?: boolean }) =>
  useQuery<CampaignListRead>({
    queryKey: ["campaigns", params],
    queryFn: () => api.get<CampaignListRead>("/campaigns", { params }).then((r) => r.data),
    ...options,
  });

export const useCampaign = (id: string) =>
  useQuery<CampaignRead>({
    queryKey: ["campaign", id],
    queryFn: () => api.get<CampaignRead>(`/campaigns/${id}`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateCampaign = () => {
  const qc = useQueryClient();
  return useMutation<CampaignRead, Error, CampaignCreatePayload>({
    mutationFn: (data) => api.post<CampaignRead>("/campaigns", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

export const useUpdateCampaign = () => {
  const qc = useQueryClient();
  return useMutation<CampaignRead, Error, { id: string; data: CampaignUpdatePayload }>({
    mutationFn: ({ id, data }) =>
      api.put<CampaignRead>(`/campaigns/${id}`, data).then((r) => r.data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign", v.id] });
    },
  });
};

export const useDeleteCampaign = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/campaigns/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

export const useCampaignStatusAction = (action: "archive" | "reopen" | "publish" | "unpublish") => {
  const qc = useQueryClient();
  return useMutation<CampaignRead, Error, string>({
    mutationFn: (id) => api.post<CampaignRead>(`/campaigns/${id}/${action}`).then((r) => r.data),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });
};

export const useCampaignDashboardStats = () =>
  useQuery<CampaignDashboardStats>({
    queryKey: ["campaign-dashboard-stats"],
    queryFn: () => api.get<CampaignDashboardStats>("/campaigns/dashboard/stats").then((r) => r.data),
  });
