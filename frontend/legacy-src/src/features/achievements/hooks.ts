import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { achievementKeys, getMyAchievements, getUserAchievements, recalculateAchievements } from "./api";

export function useMyAchievements() {
  return useQuery({
    queryKey: achievementKeys.mine(),
    queryFn: getMyAchievements,
  });
}

export function useUserAchievements(userId: string | undefined) {
  return useQuery({
    queryKey: achievementKeys.user(userId!),
    queryFn: () => getUserAchievements(userId!),
    enabled: !!userId,
  });
}

export function useRecalculateAchievements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recalculateAchievements,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
}
