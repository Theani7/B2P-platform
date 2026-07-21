import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface SocialLink {
  id: string;
  userId: string;
  platform: string;
  username?: string | null;
  url: string;
  followersCount?: number | null;
}

export interface SocialLinkInput {
  platform: string;
  username?: string;
  url: string;
  followersCount?: number;
}

export const getMySocialLinks = async (): Promise<SocialLink[]> =>
  api.get<SocialLink[]>("/social/").then((r) => r.data);

export const useMySocialLinks = () =>
  useQuery<SocialLink[]>({
    queryKey: ["my-social"],
    queryFn: getMySocialLinks,
  });

export const useCreateSocialLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SocialLinkInput) => api.post<SocialLink>("/social/", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-social"] });
      qc.invalidateQueries({ queryKey: ["profile-completion"] });
    },
  });
};

export const useUpdateSocialLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SocialLinkInput> }) =>
      api.put<SocialLink>(`/social/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-social"] });
      qc.invalidateQueries({ queryKey: ["profile-completion"] });
    },
  });
};

export const useDeleteSocialLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/social/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-social"] });
      qc.invalidateQueries({ queryKey: ["profile-completion"] });
    },
  });
};
