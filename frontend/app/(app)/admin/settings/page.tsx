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
  useDeleteSetting,
  type PlatformSetting,
} from "@/features/admin/api";

function SettingRow({ setting }: { setting: PlatformSetting }) {
  const [value, setValue] = useState(setting.settingValue);
  const update = useUpdateSetting();
  const del = useDeleteSetting();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Card className="py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-body font-medium text-midnight-ink">{setting.settingKey}</span>
            {setting.description && <Badge tone="signal">{setting.description}</Badge>}
          </div>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-2 w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none focus:border-primary"
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="subtle"
            onClick={() =>
              update.mutate(
                { key: setting.settingKey, settingValue: value, description: setting.description ?? undefined },
                { onSuccess: () => notifySuccess("Saved"), onError: (e: any) => notifyError(e?.response?.data?.message ?? "Failed") },
              )
            }
          >
            Save
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowConfirm(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Setting"
        message={`Are you sure you want to delete ${setting.settingKey}?`}
        confirmText="Delete Setting"
        isDanger={true}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          del.mutate(setting.settingKey, { 
            onSuccess: () => notifySuccess("Deleted"), 
            onError: (e: any) => notifyError(e?.response?.data?.message ?? "Failed") 
          });
          setShowConfirm(false);
        }}
      />
    </Card>
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
      <div className="space-y-3">
        {items.map((s) => (
          <SettingRow key={s.id} setting={s} />
        ))}
        {items.length === 0 && <Card><p className="text-body text-slate-custom">No settings yet — seed defaults to populate.</p></Card>}
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
