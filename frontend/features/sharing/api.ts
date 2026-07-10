import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface ProfileShare {
  publicUrl: string;
  qrCodeUrl?: string | null;
  username?: string;
  slug?: string;
}

export interface CampaignShare {
  publicUrl: string;
  qrCodeUrl?: string | null;
  campaignId: string;
  title: string;
}

export const useProfileShare = () =>
  useQuery<ProfileShare>({
    queryKey: ["share-profile"],
    queryFn: () => api.get<ProfileShare>("/sharing/profile").then((r) => r.data),
  });

export const useCampaignShare = (campaignId: string) =>
  useQuery<CampaignShare>({
    queryKey: ["share-campaign", campaignId],
    queryFn: () => api.get<CampaignShare>(`/sharing/campaign/${campaignId}`).then((r) => r.data),
    enabled: !!campaignId,
  });
