import apiClient from "../../services/apiClient";
import type { SocialLink, SocialLinkCreate, SocialLinkUpdate, SocialLinkReorder } from "./types";

export const socialKeys = {
  all: ["social"] as const,
  me: () => [...socialKeys.all, "me"] as const,
  user: (userId: string) => [...socialKeys.all, "user", userId] as const,
};

export const getMySocialLinks = async () => {
  const { data } = await apiClient.get<SocialLink[]>("/social/me");
  return data;
};

export const getUserSocialLinks = async (userId: string) => {
  const { data } = await apiClient.get<SocialLink[]>(`/social/user/${userId}`);
  return data;
};

export const createSocialLink = async (link: SocialLinkCreate) => {
  const { data } = await apiClient.post<SocialLink>("/social", link);
  return data;
};

export const updateSocialLink = async ({ id, data }: { id: string; data: SocialLinkUpdate }) => {
  const response = await apiClient.put<SocialLink>(`/social/${id}`, data);
  return response.data;
};

export const deleteSocialLink = async (id: string) => {
  await apiClient.delete(`/social/${id}`);
};

export const reorderSocialLinks = async (data: SocialLinkReorder) => {
  const response = await apiClient.put<SocialLink[]>("/social/reorder", data);
  return response.data;
};
