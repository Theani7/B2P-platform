"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { notifySuccess, notifyError } from "@/lib/notify";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  useAdminSettings,
  useSeedSettings,
  useUpdateSetting,
  type PlatformSetting,
} from "@/features/admin/api";
import { X } from "lucide-react";

function SettingRow({ setting }: { setting: PlatformSetting }) {
  const [value, setValue] = useState(setting.settingValue);
  const update = useUpdateSetting();

  const isTagList = ["campaign_categories", "industries", "promoter_niches"].includes(setting.settingKey);
  const tags = isTagList ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const addTag = (newTag: string) => {
    if (!newTag.trim()) return;
    if (tags.includes(newTag.trim())) return;
    setValue([...tags, newTag.trim()].join(","));
  };

  const removeTag = (index: number) => {
    setValue(tags.filter((_, i) => i !== index).join(","));
  };

  return (
    <div className="p-6 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="lg:w-1/3 shrink-0 pt-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-graphite font-mono tracking-tight">{setting.settingKey}</span>
          </div>
          {setting.description && (
            <p className="text-sm text-ash leading-relaxed">{setting.description}</p>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isTagList ? (
            <div className="w-full rounded-inputs border border-slate-custom/20 bg-white p-3 shadow-sm focus-within:border-signal-blue focus-within:ring-[3px] focus-within:ring-signal-blue/10 transition-all">
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-sky-wash text-signal-blue font-bold px-2.5 py-1 rounded-badges text-xs">
                    {tag}
                    <button onClick={() => removeTag(i)} className="text-signal-blue/50 hover:text-signal-blue focus:outline-none transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type and press Enter to add..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
                className="w-full text-sm font-medium text-graphite outline-none bg-transparent placeholder-ash"
              />
            </div>
          ) : (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-inputs border border-slate-custom/20 bg-white px-4 py-3 text-sm font-medium text-graphite outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 shadow-sm transition-all resize-y min-h-[100px]"
              rows={3}
            />
          )}
        </div>
        <div className="shrink-0 pt-1">
          <button
            onClick={() =>
              update.mutate(
                { key: setting.settingKey, settingValue: value, description: setting.description ?? undefined },
                { onSuccess: () => notifySuccess("Saved successfully"), onError: (e: any) => notifyError(e?.response?.data?.message ?? "Failed to save") },
              )
            }
            className="h-11 px-6 bg-white border border-slate-custom/20 rounded-button text-sm font-bold text-graphite hover:bg-sky-wash hover:text-signal-blue hover:border-signal-blue/20 transition-all shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsInner() {
  const { data, isLoading } = useAdminSettings();
  const seed = useSeedSettings();

  const items: PlatformSetting[] = Array.isArray(data)
    ? data
    : data?.items ?? [];

  if (isLoading) return <Spinner full />;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      <PageHeader
        title="Platform settings"
        subtitle="Configure global platform options."
        action={
          <Button variant="ghost" onClick={() => seed.mutate(undefined, { onSuccess: () => notifySuccess("Seeded defaults"), onError: (e: any) => notifyError(e?.response?.data?.message ?? "Failed") })}>
            Seed defaults
          </Button>
        }
      />
      <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-ash">
            No settings yet — seed defaults to populate.
          </div>
        ) : (
          <div className="divide-y divide-slate-custom/10">
            {items.map((s) => (
              <SettingRow key={s.id} setting={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <RequireAuth role={Role.ADMIN}>
      <SettingsInner />
    </RequireAuth>
  );
}
