import { useState, useEffect } from "react";
import { useAdminSettings, useAdminUpdateSetting, useAdminSeedSettings } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function PlatformSettingsPage() {
  const { data, isLoading } = useAdminSettings();
  const updateSetting = useAdminUpdateSetting();
  const seedSettings = useAdminSeedSettings();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (data && data.items.length === 0) {
      seedSettings.mutate();
    }
  }, [data]);

  if (isLoading) return <LoadingSpinner />;

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  const handleSave = (key: string) => {
    updateSetting.mutate({ setting_key: key, setting_value: editValue }, {
      onSuccess: () => {
        notifySuccess("Setting updated");
        setEditingKey(null);
      },
      onError: () => notifyError("Failed to update setting"),
    });
  };

  const handleCancel = () => {
    setEditingKey(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Platform Settings</h1>
        {data && data.items.length > 0 && (
          <span className="text-sm text-gray-500">{data.items.length} settings</span>
        )}
      </div>

      <div className="space-y-4">
        {data?.items.map((setting) => (
          <div key={setting.setting_key} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-text">{setting.setting_key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</label>
                {setting.description && <p className="text-xs text-gray-400">{setting.description}</p>}
              </div>
            </div>
            {editingKey === setting.setting_key ? (
              <div className="mt-2 flex space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 rounded border px-3 py-1.5 text-sm"
                />
                <button onClick={() => handleSave(setting.setting_key)} className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/90">Save</button>
                <button onClick={handleCancel} className="rounded border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-text">{setting.setting_value}</span>
                <button onClick={() => handleEdit(setting.setting_key, setting.setting_value)} className="text-xs text-primary hover:underline">Edit</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
