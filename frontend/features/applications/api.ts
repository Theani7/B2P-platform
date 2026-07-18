import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export interface CampaignApplication {
  id: string;
  status: ApplicationStatus;
  message?: string | null;
  createdAt: string;
  campaign?: {
    id: string;
    title: string;
    budget: number;
    location: string;
    status: string;
    businessProfile?: { companyName?: string };
  };
  promoterProfile?: {
    id: string;
    username: string;
    headline?: string | null;
    niche: string;
    avatarUrl?: string | null;
  };
}

export interface ApplicationListRead {
  items: CampaignApplication[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const useMyApplications = (params?: { page?: number; limit?: number }) =>
  useQuery<ApplicationListRead>({
    queryKey: ["my-applications", params],
    queryFn: () => api.get<ApplicationListRead>("/promoter/applications", { params }).then((r) => r.data),
  });

export const useCampaignApplications = (campaignId: string, params?: { page?: number; limit?: number }) =>
  useQuery<ApplicationListRead>({
    queryKey: ["campaign-applications", campaignId, params],
    queryFn: () =>
      api.get<ApplicationListRead>(`/campaigns/${campaignId}/applications`, { params }).then((r) => r.data),
    enabled: !!campaignId,
  });

export const useBusinessApplications = (params?: { status?: string; page?: number; limit?: number }) =>
  useQuery<ApplicationListRead>({
    queryKey: ["business-applications", params],
    queryFn: () => api.get<ApplicationListRead>("/business/applications", { params }).then((r) => r.data),
  });

export const useApplyToCampaign = () => {
  const qc = useQueryClient();
  return useMutation<{ id: string; status: string }, Error, { campaignId: string; message?: string }>({
    mutationFn: ({ campaignId, message }) =>
      api.post(`/campaigns/${campaignId}/apply`, { message }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-applications"] }),
  });
};

export const useWithdrawApplication = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/applications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-applications"] }),
  });
};

export const useAcceptApplication = () => {
  const qc = useQueryClient();
  return useMutation<{ id: string; status: string }, Error, string>({
    mutationFn: (id) => api.post(`/applications/${id}/accept`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-applications"] });
      qc.invalidateQueries({ queryKey: ["business-applications"] });
    },
  });
};

export const useRejectApplication = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.post(`/applications/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-applications"] });
      qc.invalidateQueries({ queryKey: ["business-applications"] });
    },
  });
};
