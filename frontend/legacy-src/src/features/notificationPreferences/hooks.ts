import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotificationPreferences, updateNotificationPreferences } from "./api";
import { preferencesKeys } from "./api";

export function useNotificationPreferences() {
  return useQuery({
    queryKey: preferencesKeys.list(),
    queryFn: getNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => qc.invalidateQueries({ queryKey: preferencesKeys.all }),
  });
}
