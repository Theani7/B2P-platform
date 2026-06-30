import { useState, useEffect } from "react";
import { useAdminSettings, useAdminUpdateSetting, useAdminSeedSettings, useAdminDeleteSetting } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { Plus, Trash2, Edit2, X, Settings2, Save } from "lucide-react";

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
    <div className="max-w-[900px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-midnight-ink">Platform Settings</h1>
          <p className="text-body text-ash mt-1">Configure global variables, categories, and system limits.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-buttons bg-signal-blue px-4 py-2.5 text-body font-medium text-white hover:bg-signal-blue/90 shadow-product-card transition-all"
        >
          <Plus size={18} />
          Add Setting
        </button>
      </div>

      {isAdding && (
        <div className="rounded-cards border border-slate-custom/10 border-t-2 border-t-signal-blue bg-white p-6 shadow-elevated">
          <div className="flex items-center gap-2 mb-4 text-heading-sm text-graphite">
            <Settings2 size={20} className="text-signal-blue" />
            <h3>Create New Variable</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
            <div>
              <label className="block text-caption font-medium uppercase tracking-wide text-ash mb-1.5">Key Name</label>
              <input
                type="text"
                placeholder="e.g. max_file_size"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                className="w-full rounded-inputs border border-slate-custom/10 px-4 py-2.5 text-body text-graphite focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50"
              />
            </div>
            <div>
              <label className="block text-caption font-medium uppercase tracking-wide text-ash mb-1.5">Value</label>
              <input
                type="text"
                placeholder="e.g. 10MB"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full rounded-inputs border border-slate-custom/10 px-4 py-2.5 text-body text-graphite focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50"
              />
            </div>
            <div>
              <label className="block text-caption font-medium uppercase tracking-wide text-ash mb-1.5">Description</label>
              <input
                type="text"
                placeholder="Optional explanation"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full rounded-inputs border border-slate-custom/10 px-4 py-2.5 text-body text-graphite focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-custom/10">
            <button onClick={() => setIsAdding(false)} className="rounded-buttons border border-slate-custom/10 bg-white px-5 py-2 text-body font-medium text-graphite hover:bg-sky-wash transition-colors">Cancel</button>
            <button onClick={handleAddSave} className="rounded-buttons bg-signal-blue px-5 py-2 text-body font-medium text-white hover:bg-signal-blue/90 transition-colors">Create Variable</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {data?.items.map((setting) => (
          <div key={setting.setting_key} className="group rounded-cards border border-slate-custom/10 bg-white p-6 shadow-product-card hover:border-signal-blue/30 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-heading-sm font-bold text-graphite">{setting.setting_key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</h3>
                {setting.description && <p className="text-body text-ash mt-1">{setting.description}</p>}
                <p className="text-caption font-mono text-fog mt-2 bg-linen-canvas px-2 py-0.5 rounded w-fit">{setting.setting_key}</p>
              </div>
              
              {!editingKey || editingKey !== setting.setting_key ? (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(setting.setting_key, setting.setting_value)} className="flex items-center gap-1.5 rounded-buttons bg-sky-wash text-signal-blue px-3 py-1.5 text-caption uppercase tracking-wide font-medium hover:bg-signal-blue hover:text-white transition-colors">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(setting.setting_key)} className="p-1.5 rounded-cards text-coral-alert hover:bg-coral-alert/10 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-custom/10">
              {editingKey === setting.setting_key ? (
                <div className="flex flex-col space-y-4">
                  {isListSetting(setting.setting_key) ? (
                    <div className="rounded-inputs border border-slate-custom/10 bg-linen-canvas p-2.5 flex flex-wrap gap-2 focus-within:border-signal-blue/50 focus-within:ring-1 focus-within:ring-signal-blue/50">
                      {editValue.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1.5 rounded-badges bg-white border border-slate-custom/10 px-2 py-1 text-body font-medium text-graphite shadow-product-card">
                          {tag}
                          <button type="button" onClick={() => {
                            const tags = editValue.split(',').map(t => t.trim()).filter(Boolean);
                            setEditValue(tags.filter(t => t !== tag).join(','));
                          }} className="text-ash hover:text-coral-alert transition-colors">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Type and press Enter to add..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              const tags = editValue.split(',').map(t => t.trim()).filter(Boolean);
                              if (!tags.includes(val)) {
                                setEditValue(tags.length > 0 ? `${editValue},${val}` : val);
                              }
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                        className="flex-1 bg-transparent text-body text-graphite min-w-[200px] px-2 py-1 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full rounded-inputs border border-slate-custom/10 px-4 py-2.5 text-body text-graphite focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50"
                    />
                  )}
                  <div className="flex gap-3 justify-end">
                    <button onClick={handleCancel} className="rounded-buttons border border-slate-custom/10 bg-white px-5 py-2 text-body font-medium text-graphite hover:bg-sky-wash transition-colors">Cancel</button>
                    <button onClick={() => handleSave(setting.setting_key)} className="flex items-center gap-2 rounded-buttons bg-signal-blue px-5 py-2 text-body font-medium text-white hover:opacity-90 transition-colors">
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {isListSetting(setting.setting_key) ? (
                    <div className="flex flex-wrap gap-2">
                      {setting.setting_value.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="inline-flex items-center rounded-badges bg-sky-wash px-2.5 py-1 text-caption uppercase tracking-wide font-medium text-signal-blue">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body text-graphite font-medium">{setting.setting_value}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
