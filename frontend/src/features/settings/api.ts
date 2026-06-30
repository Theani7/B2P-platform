import { useQuery } from "@tanstack/react-query";
import api from "../../services/apiClient";
import type { PlatformSettingListResponse } from "./types";

export function usePlatformSettings() {
  return useQuery<PlatformSettingListResponse>({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const res = await api.get("/settings");
      return res.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour to prevent excessive calls
  });
}
