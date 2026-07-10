import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export interface CampaignInvitation {
  id: string;
  status: InvitationStatus;
  message?: string | null;
  createdAt: string;
  campaign?: {
    id: string;
    title: string;
    budget: number;
    category?: string | null;
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

export interface InvitationListRead {
  items: CampaignInvitation[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const useBusinessInvitations = (params?: { status?: string; page?: number; limit?: number }) =>
  useQuery<InvitationListRead>({
    queryKey: ["business-invitations", params],
    queryFn: () => api.get<InvitationListRead>("/business/invitations", { params }).then((r) => r.data),
  });

export const usePromoterInvitations = (params?: { status?: string; page?: number; limit?: number }) =>
  useQuery<InvitationListRead>({
    queryKey: ["promoter-invitations", params],
    queryFn: () => api.get<InvitationListRead>("/promoter/invitations", { params }).then((r) => r.data),
  });

export const useInvitePromoter = () => {
  const qc = useQueryClient();
  return useMutation<{ id: string; status: string }, Error, { campaignId: string; promoterId: string; message?: string }>({
    mutationFn: ({ campaignId, promoterId, message }) =>
      api.post(`/campaigns/${campaignId}/invite/${promoterId}`, { message }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-invitations"] }),
  });
};

export const useCancelInvitation = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/invitations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-invitations"] }),
  });
};

export const useAcceptInvitation = () => {
  const qc = useQueryClient();
  return useMutation<{ id: string; status: string }, Error, string>({
    mutationFn: (id) => api.post(`/invitations/${id}/accept`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promoter-invitations"] }),
  });
};

export const useRejectInvitation = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.post(`/invitations/${id}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promoter-invitations"] }),
  });
};
