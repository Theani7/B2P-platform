import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface BusinessProfileRead {
  id: string;
  companyName: string;
  industry: string;
  description?: string;
  location?: string;
  website?: string;
  logoUrl?: string;
  companySize?: string;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoterProfileRead {
  id: string;
  username: string;
  headline?: string;
  bio?: string;
  niche: string;
  location?: string;
  avatarUrl?: string;
  followersCount: number;
  engagementRate: number;
  yearsExperience?: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BusinessProfileInput = Partial<BusinessProfileRead>;
export type PromoterProfileInput = Partial<PromoterProfileRead>;

export const useBusinessProfile = () =>
  useQuery<BusinessProfileRead>({
    queryKey: ["business-profile"],
    queryFn: () => api.get("/business/profile").then((r) => r.data),
  });

export const useCreateBusinessProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BusinessProfileInput) => api.post("/business/profile", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business-profile"] });
      qc.invalidateQueries({ queryKey: ["currentUser"] });
      qc.invalidateQueries({ queryKey: ["profile-completion"] });
    },
  });
};

export const useUpdateBusinessProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BusinessProfileInput) => api.put("/business/profile", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business-profile"] });
      qc.invalidateQueries({ queryKey: ["currentUser"] });
      qc.invalidateQueries({ queryKey: ["profile-completion"] });
    },
  });
};

export const usePromoterProfile = () =>
  useQuery<PromoterProfileRead>({
    queryKey: ["promoter-profile"],
    queryFn: () => api.get("/promoter/profile").then((r) => r.data),
  });

export const useCreatePromoterProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PromoterProfileInput) => api.post("/promoter/profile", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promoter-profile"] });
      qc.invalidateQueries({ queryKey: ["currentUser"] });
      qc.invalidateQueries({ queryKey: ["profile-completion"] });
    },
  });
};

export const useUpdatePromoterProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PromoterProfileInput) => api.put("/promoter/profile", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promoter-profile"] });
      qc.invalidateQueries({ queryKey: ["currentUser"] });
      qc.invalidateQueries({ queryKey: ["profile-completion"] });
    },
  });
};

export interface VerificationRequestRead {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
}

export const useMyVerificationRequests = () =>
  useQuery<VerificationRequestRead[]>({
    queryKey: ["my-verification-requests"],
    queryFn: () => api.get<VerificationRequestRead[]>("/promoter/verification-request").then((r) => r.data),
  });
