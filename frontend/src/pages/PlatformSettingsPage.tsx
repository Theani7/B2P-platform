import { useState, useEffect } from "react";
import { useAdminSettings, useAdminUpdateSetting, useAdminSeedSettings, useAdminDeleteSetting } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { Plus, Trash2, Edit2, X } from "lucide-react";

export default function PlatformSettingsPage() {
  const { data, isLoading } = useAdminSettings();
  const updateSetting = useAdminUpdateSetting();
  const deleteSetting = useAdminDeleteSetting();
  const seedSettings = useAdminSeedSettings();
  
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDesc, setNewDesc] = useState("");

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

  const isListSetting = (key: string) => {
    return ["campaign_categories", "industries", "promoter_niches"].includes(key) || key.includes("categories") || key.includes("industries") || key.includes("niches");
  };

  const handleAddSave = () => {
    if (!newKey || !newValue) {
      notifyError("Key and Value are required");
      return;
    }
    updateSetting.mutate({ setting_key: newKey, setting_value: newValue, description: newDesc }, {
      onSuccess: () => {
        notifySuccess("Setting created");
        setIsAdding(false);
        setNewKey("");
        setNewValue("");
        setNewDesc("");
      },
      onError: () => notifyError("Failed to create setting"),
    });
  };

  const handleDelete = (key: string) => {
    if (confirm(`Are you sure you want to delete the setting: ${key}?`)) {
      deleteSetting.mutate(key, {
        onSuccess: () => notifySuccess("Setting deleted"),
        onError: () => notifyError("Failed to delete setting"),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-stone-900 font-stretch-condensed">Platform Settings</h1>
          {data && data.items.length > 0 && (
            <span className="text-sm text-stone-500">{data.items.length} variables configured</span>
          )}
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white hover:bg-brand-indigo-900 transition-colors"
        >
          <Plus size={16} />
          Add Setting
        </button>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-medium text-stone-900 mb-4">Add New Setting</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
            <input
              type="text"
              placeholder="Key (e.g. max_file_size)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-purple"
            />
            <input
              type="text"
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-purple"
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-purple"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAdding(false)} className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50 transition-colors">Cancel</button>
            <button onClick={handleAddSave} className="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white hover:bg-brand-indigo-900 transition-colors">Create</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {data?.items.map((setting) => (
          <div key={setting.setting_key} className="rounded-xl border border-stone-100 bg-white p-5 border-t-[1px] border-t-brand-purple">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-stone-900">{setting.setting_key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</label>
                {setting.description && <p className="text-xs text-stone-400 mt-1">{setting.description}</p>}
              </div>
            </div>
            {editingKey === setting.setting_key ? (
              <div className="mt-4 flex flex-col space-y-3">
                {isListSetting(setting.setting_key) ? (
                  <div className="rounded-lg border border-stone-200 p-2 flex flex-wrap gap-2 focus-within:border-brand-purple">
                    {editValue.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-purple/10 px-2.5 py-1 text-xs font-medium text-brand-purple">
                        {tag}
                        <button type="button" onClick={() => {
                          const tags = editValue.split(',').map(t => t.trim()).filter(Boolean);
                          setEditValue(tags.filter(t => t !== tag).join(','));
                        }} className="text-brand-purple hover:text-brand-purple-900 p-0.5 rounded-full hover:bg-brand-purple/20 transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Type and press Enter to add..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim().toUpperCase().replace(/\s+/g, '_');
                          if (val) {
                            const tags = editValue.split(',').map(t => t.trim()).filter(Boolean);
                            if (!tags.includes(val)) {
                              setEditValue(tags.length > 0 ? `${editValue},${val}` : val);
                            }
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                      className="flex-1 bg-transparent text-sm text-stone-900 min-w-[150px] px-2 py-1 focus:outline-none"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                )}
                <div className="flex gap-3">
                  <button onClick={() => handleSave(setting.setting_key)} className="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white hover:bg-brand-indigo-900 transition-colors">Save</button>
                  <button onClick={handleCancel} className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-start justify-between gap-4">
                {isListSetting(setting.setting_key) ? (
                  <div className="flex flex-wrap gap-2">
                    {setting.setting_value.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-stone-900 truncate">{setting.setting_value}</span>
                )}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(setting.setting_key, setting.setting_value)} className="p-1.5 text-stone-400 hover:text-brand-purple hover:bg-brand-purple/10 rounded-md transition-colors" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(setting.setting_key)} className="p-1.5 text-stone-400 hover:text-brand-coral hover:bg-brand-coral/10 rounded-md transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
