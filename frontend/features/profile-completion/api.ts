import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface ProfileCompletionResponse {
  type: "BUSINESS" | "PROMOTER";
  completion: number;
  completed: number;
  total: number;
  missing: string[];
}

export const useProfileCompletion = () =>
  useQuery<ProfileCompletionResponse>({
    queryKey: ["profile-completion"],
    queryFn: () => api.get<ProfileCompletionResponse>("/profile-completion").then((r) => r.data),
  });
