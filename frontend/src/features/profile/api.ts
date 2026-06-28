import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/apiClient";
import type { BusinessProfileRead, PromoterProfileRead } from "./types";

// Upload helpers
export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
};

export const uploadLogo = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
};

// Business profile hooks
export const useBusinessProfile = () =>
  useQuery<BusinessProfileRead>({
    queryKey: ["business-profile"],
    queryFn: () => api.get("/business/profile").then(r => r.data),
  });

export const useUpsertBusinessProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { company_name: string; industry: string; description?: string; location?: string; website?: string; logo_url?: string }) =>
      api.post("/business/profile", data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business-profile"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

// Promoter profile hooks
export const usePromoterProfile = () =>
  useQuery<PromoterProfileRead>({
    queryKey: ["promoter-profile"],
    queryFn: () => api.get("/promoter/profile").then(r => r.data),
  });

export const useUpsertPromoterProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { headline?: string; bio?: string; niche?: string; location?: string; avatar_url?: string }) => 
      api.post("/promoter/profile", data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promoter-profile"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

// Public promoter profile
export const usePublicPromoterProfile = (username: string) =>
  useQuery<PromoterProfileRead>({ queryKey: ["promoter", username], queryFn: () => api.get(`/promoters/${username}`).then(r => r.data) });

// Directory
export const usePromoterDirectory = () =>
  useQuery<{ items: PromoterProfileRead[] }>({ queryKey: ["promoter-directory"], queryFn: () => api.get("/directory/promoters").then(r => r.data) });