import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/apiClient";
import {
  CampaignMarketplaceResponse,
  CampaignApplicationListResponse,
  CampaignInvitationListResponse,
  CollaborationListResponse,
} from "./types";

export const useCampaignMarketplace = (params?: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) =>
  useQuery<CampaignMarketplaceResponse>({
    queryKey: ["campaign-marketplace", params],
    queryFn: () =>
      api.get("/campaign-marketplace", { params }).then((r) => r.data),
  });

export const useApplyToCampaign = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, { campaignId: string; message?: string }>({
    mutationFn: ({ campaignId, message }) =>
      api.post(`/campaigns/${campaignId}/apply`, { message }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["promoter-applications"] });
      qc.invalidateQueries({ queryKey: ["campaign-marketplace"] });
      qc.invalidateQueries({ queryKey: ["campaign-applications", variables.campaignId] });
    },
  });
};

export const useToggleBookmark = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, { campaignId: string; bookmarked: boolean }>({
    mutationFn: ({ campaignId, bookmarked }) => {
      if (bookmarked) {
        return api.post(`/campaign-marketplace/${campaignId}/bookmark`);
      } else {
        return api.delete(`/campaign-marketplace/${campaignId}/bookmark`);
      }
    },
    onSuccess: () => {
      // Opt to not invalidate instantly to prevent harsh re-renders,
      // but invalidate in the background if we want true sync.
    },
  });
};

export const useWithdrawApplication = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (applicationId) =>
      api.delete(`/applications/${applicationId}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["promoter-applications"] }),
  });
};

export const usePromoterApplications = (params?: {
  page?: number;
  limit?: number;
}) =>
  useQuery<CampaignApplicationListResponse>({
    queryKey: ["promoter-applications", params],
    queryFn: () =>
      api.get("/promoter/applications", { params }).then((r) => r.data),
  });

export const useCampaignApplications = (
  campaignId: string,
  params?: { page?: number; limit?: number }
) =>
  useQuery<CampaignApplicationListResponse>({
    queryKey: ["campaign-applications", campaignId, params],
    queryFn: () =>
      api
        .get(`/business/campaigns/${campaignId}/applications`, { params })
        .then((r) => r.data),
    enabled: !!campaignId,
  });

export const useBusinessApplications = (
  params?: { page?: number; limit?: number }
) =>
  useQuery<CampaignApplicationListResponse>({
    queryKey: ["business-applications", params],
    queryFn: () =>
      api
        .get(`/business/applications`, { params })
        .then((r) => r.data),
  });

export const useAcceptApplication = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (applicationId) =>
      api.post(`/business/applications/${applicationId}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-applications"] });
      qc.invalidateQueries({ queryKey: ["business-collaborations"] });
    },
  });
};

export const useRejectApplication = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (applicationId) =>
      api.post(`/business/applications/${applicationId}/reject`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["campaign-applications"] }),
  });
};

export const useInvitePromoter = () => {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { campaignId: string; promoterId: string; message?: string }
  >({
    mutationFn: ({ campaignId, promoterId, message }) =>
      api.post(`/campaigns/${campaignId}/invite/${promoterId}`, { message }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["business-invitations"] }),
  });
};

export const useCancelInvitation = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (invitationId) =>
      api.delete(`/invitations/${invitationId}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["business-invitations"] }),
  });
};

export const useBusinessInvitations = (params?: {
  page?: number;
  limit?: number;
}) =>
  useQuery<CampaignInvitationListResponse>({
    queryKey: ["business-invitations", params],
    queryFn: () =>
      api.get("/business/invitations", { params }).then((r) => r.data),
  });

export const usePromoterInvitations = (params?: {
  page?: number;
  limit?: number;
}) =>
  useQuery<CampaignInvitationListResponse>({
    queryKey: ["promoter-invitations", params],
    queryFn: () =>
      api.get("/promoter/invitations", { params }).then((r) => r.data),
  });

export const useAcceptInvitation = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (invitationId) =>
      api.post(`/invitations/${invitationId}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promoter-invitations"] });
      qc.invalidateQueries({ queryKey: ["promoter-collaborations"] });
    },
  });
};

export const useRejectInvitation = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (invitationId) =>
      api.post(`/invitations/${invitationId}/reject`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["promoter-invitations"] }),
  });
};

export const useBusinessCollaborations = (
  params?: { page?: number; limit?: number },
  enabled?: boolean,
) =>
  useQuery<CollaborationListResponse>({
    queryKey: ["business-collaborations", params],
    queryFn: () =>
      api.get("/business/collaborations", { params }).then((r) => r.data),
    enabled: enabled ?? true,
  });

export const usePromoterCollaborations = (
  params?: { page?: number; limit?: number },
  enabled?: boolean,
) =>
  useQuery<CollaborationListResponse>({
    queryKey: ["promoter-collaborations", params],
    queryFn: () =>
      api.get("/promoter/collaborations", { params }).then((r) => r.data),
    enabled: enabled ?? true,
  });
