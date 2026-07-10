import apiClient from "../../services/apiClient";
import type { ShareProfileResponse } from "./types";

export const sharingApi = {
  getProfileShareInfo: async (): Promise<ShareProfileResponse> => {
    const { data } = await apiClient.get<ShareProfileResponse>("/share/profile");
    return (data as any).data || data;
  }
};
