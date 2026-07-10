import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string | null;
  icon: string | null;
  points: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAchievement {
  id: string | null;
  userId: string;
  achievementId: string;
  earnedAt: string | null;
  progress: number;
  metadata: Record<string, unknown> | null;
  achievement: Achievement;
}

export interface LevelInfo {
  level: number;
  totalPoints: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progressPercentage: number;
}

export interface MyAchievementsResponse {
  achievements: UserAchievement[];
  levelInfo: LevelInfo;
}

export type AchievementListResponse = Achievement[];

export const useAchievementsCatalog = () =>
  useQuery<AchievementListResponse>({
    queryKey: ["achievements-catalog"],
    queryFn: () => api.get<AchievementListResponse>("/achievements").then((r) => r.data),
  });

export const useMyAchievements = () =>
  useQuery<MyAchievementsResponse>({
    queryKey: ["achievements-me"],
    queryFn: () => api.get<MyAchievementsResponse>("/achievements/me").then((r) => r.data),
  });

export const useUserAchievements = (userId: string) =>
  useQuery<MyAchievementsResponse>({
    queryKey: ["achievements-user", userId],
    queryFn: () => api.get<MyAchievementsResponse>(`/achievements/users/${userId}`).then((r) => r.data),
    enabled: !!userId,
  });

export const useRecalculateAchievements = () => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; count: number }, Error>({
    mutationFn: () => api.post("/achievements/recalculate").then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["achievements-catalog"] });
      qc.invalidateQueries({ queryKey: ["achievements-me"] });
    },
  });
};
