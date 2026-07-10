import React from "react";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/features/notificationPreferences";
import { Switch } from "@/components/ui/Switch";
import { Loader2 } from "lucide-react";

export function NotificationPreferences() {
  const { data, isLoading } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();
  const [localPrefs, setLocalPrefs] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (data) {
      const map: Record<string, boolean> = {};
      data.forEach((p: any) => (map[p.type] = p.enabled));
      setLocalPrefs(map);
    }
  }, [data]);

  const toggle = (type: string) => {
    const next = { ...localPrefs, [type]: !localPrefs[type] };
    setLocalPrefs(next);
    update.mutate(
      Object.entries(next).map(([type, enabled]) => ({ type, enabled }))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={16} />
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
      <div className="space-y-3">
        {Object.entries(localPrefs).map(([type, enabled]) => (
          <div
            key={type}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <span className="text-sm text-gray-700">
              {type.replace(/_/g, " ").toLowerCase()}
            </span>
            <Switch checked={enabled} onCheckedChange={() => toggle(type)} />
          </div>
        ))}
      </div>
    </div>
  );
}
