"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import { Role } from "@/lib/roles";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { usePublicSettings, useAccountSettings } from "@/features/settings/api";
import {
  useAdminSettings,
  useSeedSettings,
  useUpdateSetting,
  useDeleteSetting,
} from "@/features/admin/api";
import { UploadField } from "@/components/common/UploadField";
import { Plus, Trash2, Edit2, X, Settings2, Save } from "lucide-react";

function AccountCard() {
  const { data: account, isLoading } = useAccountSettings();
  const { user } = useAuth();
  if (isLoading) return <Spinner />;
  if (!account) return null;
  return (
    <Card>
      <h2 className="mb-3 text-heading-sm font-semibold text-midnight-ink">Account</h2>
      <div className="grid gap-2">
        <div className="flex justify-between border-b border-steel/10 py-2 last:border-0">
          <span className="text-caption uppercase tracking-wide text-steel">Username</span>
          <span className="text-body font-medium text-midnight-ink">{account.user.username}</span>
        </div>
        <div className="flex justify-between border-b border-steel/10 py-2 last:border-0">
          <span className="text-caption uppercase tracking-wide text-steel">Name</span>
          <span className="text-body font-medium text-midnight-ink">{account.user.fullName}</span>
        </div>
        <div className="flex justify-between border-b border-steel/10 py-2 last:border-0">
          <span className="text-caption uppercase tracking-wide text-steel">Email</span>
          <span className="text-body font-medium text-midnight-ink">{account.user.email}</span>
        </div>
        <div className="flex justify-between border-b border-steel/10 py-2 last:border-0">
          <span className="text-caption uppercase tracking-wide text-steel">Role</span>
          <span className="text-body font-medium text-midnight-ink">{account.user.role}</span>
        </div>
        <div className="flex justify-between border-b border-steel/10 py-2 last:border-0">
          <span className="text-caption uppercase tracking-wide text-steel">Verified</span>
          <span className="text-body font-medium text-midnight-ink">{account.user.isVerified ? "Yes" : "No"}</span>
        </div>
        {account.promoterProfile && (
          <div className="flex justify-between border-b border-steel/10 py-2 last:border-0">
            <span className="text-caption uppercase tracking-wide text-steel">Promoter</span>
            <span className="text-body font-medium text-midnight-ink">{account.promoterProfile.username}</span>
          </div>
        )}
        {account.businessProfile && (
          <div className="flex justify-between border-b border-steel/10 py-2 last:border-0">
            <span className="text-caption uppercase tracking-wide text-steel">Company</span>
            <span className="text-body font-medium text-midnight-ink">{account.businessProfile.companyName}</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <p className="text-caption uppercase tracking-wide text-steel">Profile picture</p>
        <UploadField kind="avatar" label="Upload avatar" />
        {user?.role === Role.BUSINESS && (
          <>
            <p className="text-caption uppercase tracking-wide text-steel">Company logo</p>
            <UploadField kind="logo" label="Upload logo" />
          </>
        )}
      </div>
    </Card>
  );
}

const isListSetting = (key: string) =>
  ["campaign_categories", "industries", "promoter_niches"].includes(key) ||
  key.includes("categories") ||
  key.includes("industries") ||
  key.includes("niches");

function PlatformSettingsCard() {
  const { data, isLoading } = useAdminSettings();
  const updateSetting = useUpdateSetting();
  const deleteSetting = useDeleteSetting();
  const seedSettings = useSeedSettings();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    if (data && Array.isArray(data) && data.length === 0) seedSettings.mutate();
  }, [data]);

  if (isLoading) return <Spinner />;
  const items = Array.isArray(data) ? data : [];

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };
  const handleSave = (key: string) => {
    updateSetting.mutate(
      { key, settingValue: editValue },
      {
        onSuccess: () => { toast.success("Setting updated"); setEditingKey(null); },
        onError: () => toast.error("Failed to update setting"),
      },
    );
  };
  const handleAddSave = () => {
    if (!newKey || !newValue) { toast.error("Key and Value are required"); return; }
    updateSetting.mutate(
      { key: newKey, settingValue: newValue, description: newDesc },
      {
        onSuccess: () => { toast.success("Setting created"); setIsAdding(false); setNewKey(""); setNewValue(""); setNewDesc(""); },
        onError: () => toast.error("Failed to create setting"),
      },
    );
  };
  const handleDelete = (key: string) => {
    if (confirm(`Are you sure you want to delete the setting: ${key}?`)) {
      deleteSetting.mutate(key, {
        onSuccess: () => toast.success("Setting deleted"),
        onError: () => toast.error("Failed to delete setting"),
      });
    }
  };

  return (
    <div className="max-w-[900px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-heading text-midnight-ink">Platform Settings</h1>
          <p className="mt-1 text-body text-ash">Configure global variables, categories, and system limits.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-buttons bg-signal-blue px-4 py-2.5 text-body font-medium text-white shadow-product-card transition-all hover:bg-signal-blue/90"
        >
          <Plus size={18} /> Add Setting
        </button>
      </div>

      {isAdding && (
        <div className="rounded-cards border border-slate-custom/10 border-t-2 border-t-signal-blue bg-white p-6 shadow-product-card">
          <div className="mb-4 flex items-center gap-2 text-heading-sm text-graphite">
            <Settings2 size={20} className="text-signal-blue" />
            <h3>Create New Variable</h3>
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-caption font-medium uppercase tracking-wide text-ash">Key Name</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                className="w-full rounded-inputs border border-slate-custom/10 px-4 py-2.5 text-body text-graphite outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-caption font-medium uppercase tracking-wide text-ash">Value</label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full rounded-inputs border border-slate-custom/10 px-4 py-2.5 text-body text-graphite outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-caption font-medium uppercase tracking-wide text-ash">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full rounded-inputs border border-slate-custom/10 px-4 py-2.5 text-body text-graphite outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-custom/10 pt-4">
            <button onClick={() => setIsAdding(false)} className="rounded-buttons border border-slate-custom/10 bg-white px-5 py-2 text-body font-medium text-graphite hover:bg-sky-wash">Cancel</button>
            <button onClick={handleAddSave} className="rounded-buttons bg-signal-blue px-5 py-2 text-body font-medium text-white hover:bg-signal-blue/90">Create Variable</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {items.map((s) => (
          <div key={s.settingKey} className="group rounded-cards border border-slate-custom/10 bg-white p-6 shadow-product-card transition-all hover:border-signal-blue/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-heading-sm font-bold text-graphite">
                  {s.settingKey.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </h3>
                {s.description && <p className="mt-1 text-body text-ash">{s.description}</p>}
                <p className="mt-2 w-fit rounded bg-linen-canvas px-2 py-0.5 font-mono text-caption text-fog">{s.settingKey}</p>
              </div>
              {(!editingKey || editingKey !== s.settingKey) && (
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => handleEdit(s.settingKey, s.settingValue)} className="flex items-center gap-1.5 rounded-buttons bg-sky-wash px-3 py-1.5 text-caption font-medium uppercase tracking-wide text-signal-blue hover:bg-signal-blue hover:text-white">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(s.settingKey)} className="rounded-cards p-1.5 text-coral-alert hover:bg-coral-alert/10" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-slate-custom/10 pt-4">
              {editingKey === s.settingKey ? (
                <div className="flex flex-col space-y-4">
                  {isListSetting(s.settingKey) ? (
                    <div className="flex flex-wrap gap-2 rounded-inputs border border-slate-custom/10 bg-linen-canvas p-2.5 focus-within:border-signal-blue/50 focus-within:ring-1 focus-within:ring-signal-blue/50">
                      {editValue.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1.5 rounded-badges border border-slate-custom/10 bg-white px-2 py-1 text-body font-medium text-graphite shadow-product-card">
                          {tag}
                          <button
                            type="button"
                            onClick={() => setEditValue(editValue.split(",").map((t) => t.trim()).filter(Boolean).filter((t) => t !== tag).join(","))}
                            className="text-ash hover:text-coral-alert"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Type and press Enter to add..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              const tags = editValue.split(",").map((t) => t.trim()).filter(Boolean);
                              if (!tags.includes(val)) setEditValue(tags.length > 0 ? `${editValue},${val}` : val);
                            }
                            e.currentTarget.value = "";
                          }
                        }}
                        className="min-w-[200px] flex-1 bg-transparent px-2 py-1 text-body text-graphite outline-none"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full rounded-inputs border border-slate-custom/10 px-4 py-2.5 text-body text-graphite outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50"
                    />
                  )}
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditingKey(null)} className="rounded-buttons border border-slate-custom/10 bg-white px-5 py-2 text-body font-medium text-graphite hover:bg-sky-wash">Cancel</button>
                    <button onClick={() => handleSave(s.settingKey)} className="flex items-center gap-2 rounded-buttons bg-signal-blue px-5 py-2 text-body font-medium text-white hover:opacity-90">
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {isListSetting(s.settingKey) ? (
                    <div className="flex flex-wrap gap-2">
                      {s.settingValue.split(",").map((t: string) => t.trim()).filter(Boolean).map((tag: string) => (
                        <span key={tag} className="inline-flex rounded-badges bg-sky-wash px-2.5 py-1 text-caption font-medium uppercase tracking-wide text-signal-blue">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body font-medium text-graphite">{s.settingValue}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-body text-slate-custom">No platform settings configured.</p>}
      </div>
    </div>
  );
}

function PublicSettingsCard() {
  const { data, isLoading } = usePublicSettings();
  if (isLoading) return <Spinner />;
  return (
    <Card>
      <h2 className="mb-3 text-heading-sm font-semibold text-midnight-ink">Platform settings</h2>
      {data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((s) => (
            <div key={s.id} className="border-b border-steel/10 pb-3 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-body font-medium text-midnight-ink">{s.settingKey}</span>
                {s.description && <Badge tone="signal">{s.description}</Badge>}
              </div>
              <p className="mt-1 break-words text-caption text-slate-custom">{s.settingValue}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body text-slate-custom">No platform settings configured.</p>
      )}
    </Card>
  );
}

function SettingsInner() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AccountCard />
      {isAdmin ? <PlatformSettingsCard /> : <PublicSettingsCard />}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <PageHeader title="Settings" subtitle="Your account and platform configuration." />
      <SettingsInner />
    </RequireAuth>
  );
}
