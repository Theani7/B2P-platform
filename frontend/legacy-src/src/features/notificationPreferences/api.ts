import apiClient from "@/services/apiClient";

export const preferencesKeys = {
  all: ["notificationPreferences"] as const,
  list: () => [...preferencesKeys.all, "list"] as const,
};

export async function getNotificationPreferences() {
  const { data } = await apiClient.get("/notifications/preferences");
  return data.data.preferences;
}

export async function updateNotificationPreferences(
  preferences: Array<{ type: string; enabled: boolean }>
) {
  const { data } = await apiClient.put("/notifications/preferences", { preferences });
  return data.data.preferences;
}
