import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export type CollaborationStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type DeliverableStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "REVISION_REQUESTED"
  | "PUBLISHED";

export interface Collaboration {
  id: string;
  campaignId: string;
  businessProfileId: string;
  promoterProfileId: string;
  applicationId?: string | null;
  invitationId?: string | null;
  status: CollaborationStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  campaignTitle: string;
  campaignCategory: string;
  campaignBudget: number;
  campaignStartDate?: string | null;
  campaignEndDate?: string | null;
  partnerName: string;
  partnerUsername: string;
  partnerAvatarUrl?: string | null;
  hasReview: boolean;
}

export interface CollaborationListRead {
  items: Collaboration[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Deliverable {
  id: string;
  collaborationId: string;
  title: string;
  description?: string | null;
  contentUrl: string;
  status: DeliverableStatus;
  feedback?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverableInput {
  title: string;
  description?: string;
  contentUrl: string;
}

export interface CollaborationParams {
  status?: CollaborationStatus;
  page?: number;
  limit?: number;
}

// --- Business ---
export const useBusinessCollaborations = (params?: CollaborationParams) =>
  useQuery<CollaborationListRead>({
    queryKey: ["business-collaborations", params],
    queryFn: () => api.get<CollaborationListRead>("/business/collaborations", { params }).then((r) => r.data),
  });

export const useBusinessDeliverables = (collaborationId: string) =>
  useQuery<Deliverable[]>({
    queryKey: ["deliverables", "business", collaborationId],
    queryFn: () =>
      api.get<Deliverable[]>(`/business/collaborations/${collaborationId}/deliverables`).then((r) => r.data),
    enabled: !!collaborationId,
  });

export const useReviewDeliverable = () => {
  const qc = useQueryClient();
  return useMutation<
    Deliverable,
    Error,
    { collaborationId: string; deliverableId: string; status: DeliverableStatus; feedback?: string }
  >({
    mutationFn: ({ collaborationId, deliverableId, status, feedback }) =>
      api
        .patch(`/business/collaborations/${collaborationId}/deliverables/${deliverableId}/review`, { status, feedback })
        .then((r) => r.data),
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["deliverables", "business", v.collaborationId] }),
  });
};

// --- Promoter ---
export const usePromoterCollaborations = (params?: CollaborationParams) =>
  useQuery<CollaborationListRead>({
    queryKey: ["promoter-collaborations", params],
    queryFn: () => api.get<CollaborationListRead>("/promoter/collaborations", { params }).then((r) => r.data),
  });

export const usePromoterDeliverables = (collaborationId: string) =>
  useQuery<Deliverable[]>({
    queryKey: ["deliverables", "promoter", collaborationId],
    queryFn: () =>
      api.get<Deliverable[]>(`/promoter/collaborations/${collaborationId}/deliverables`).then((r) => r.data),
    enabled: !!collaborationId,
  });

export const useSubmitDeliverable = () => {
  const qc = useQueryClient();
  return useMutation<Deliverable, Error, { collaborationId: string; data: DeliverableInput }>({
    mutationFn: ({ collaborationId, data }) =>
      api.post(`/promoter/collaborations/${collaborationId}/deliverables`, data).then((r) => r.data),
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["deliverables", "promoter", v.collaborationId] }),
  });
};
