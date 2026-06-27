import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/apiClient";
import {
  CampaignRead,
  CampaignCreatePayload,
  CampaignUpdatePayload,
  CampaignListRead,
  CampaignDashboardStats,
} from "./types";

export const useCampaigns = (params?: { search?: string; page?: number; limit?: number; sort?: string }) =>
  useQuery<CampaignListRead>({
    queryKey: ["campaigns", params],
    queryFn: () =>
      api
        .get("/campaigns", { params })
        .then((r) => r.data),
  });

export const useCampaign = (id: string) =>
  useQuery<CampaignRead>({
    queryKey: ["campaign", id],
    queryFn: () => api.get(`/campaigns/${id}`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateCampaign = () => {
  const qc = useQueryClient();
  return useMutation<CampaignRead, Error, CampaignCreatePayload>({
    mutationFn: (data) => api.post("/campaigns", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

export const useUpdateCampaign = () => {
  const qc = useQueryClient();
  return useMutation<CampaignRead, Error, { id: string; data: CampaignUpdatePayload }>({
    mutationFn: ({ id, data }) => api.put(`/campaigns/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign"] });
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

export const useArchiveCampaign = () => {
  const qc = useQueryClient();
  return useMutation<CampaignRead, Error, string>({
    mutationFn: (id) => api.post(`/campaigns/${id}/archive`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign"] });
    },
  });
};

export const useReopenCampaign = () => {
  const qc = useQueryClient();
  return useMutation<CampaignRead, Error, string>({
    mutationFn: (id) => api.post(`/campaigns/${id}/reopen`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign"] });
    },
  });
};

export const usePublishCampaign = () => {
  const qc = useQueryClient();
  return useMutation<CampaignRead, Error, string>({
    mutationFn: (id) => api.post(`/campaigns/${id}/publish`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign"] });
    },
  });
};

export const useUnpublishCampaign = () => {
  const qc = useQueryClient();
  return useMutation<CampaignRead, Error, string>({
    mutationFn: (id) => api.post(`/campaigns/${id}/unpublish`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign"] });
    },
  });
};

export const useCampaignDashboardStats = () =>
  useQuery<CampaignDashboardStats>({
    queryKey: ["campaign-dashboard-stats"],
    queryFn: () => api.get("/campaigns/dashboard/stats").then((r) => r.data),
  });
