import { useQuery } from "@tanstack/react-query";
import { sharingApi } from "./api";

export function useShareProfile() {
  return useQuery({
    queryKey: ["shareProfile"],
    queryFn: sharingApi.getProfileShareInfo,
    staleTime: Infinity,
  });
}
