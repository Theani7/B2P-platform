import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface PlatformSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  description: string | null;
  updatedAt: string;
}

export interface AccountSettings {
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  promoterProfile: { username: string; niche: string | null } | null;
  businessProfile: { companyName: string } | null;
  notificationPreferences: { id: string; type: string; enabled: boolean }[];
}

export const usePublicSettings = () =>
  useQuery<PlatformSetting[]>({
    queryKey: ["settings-public"],
    queryFn: () => api.get<PlatformSetting[]>("/settings").then((r) => r.data),
  });

export const useAccountSettings = () =>
  useQuery<AccountSettings>({
    queryKey: ["settings-account"],
    queryFn: () => api.get<AccountSettings>("/settings/account").then((r) => r.data),
  });
