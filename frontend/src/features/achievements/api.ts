import apiClient from "../../services/apiClient";
import type { AchievementResponse } from "./types";

export const achievementKeys = {
  all: ["achievements"] as const,
  mine: () => [...achievementKeys.all, "me"] as const,
  user: (userId: string) => [...achievementKeys.all, "user", userId] as const,
};

export const getMyAchievements = async () => {
  const { data } = await apiClient.get<AchievementResponse>("/achievements/me");
  return data;
};

export const getUserAchievements = async (userId: string) => {
  const { data } = await apiClient.get<AchievementResponse>(`/users/${userId}/achievements`);
  return data;
};

export const recalculateAchievements = async () => {
  await apiClient.post("/achievements/recalculate");
};
