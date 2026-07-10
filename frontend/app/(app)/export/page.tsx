"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Card, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Download, FileText, FileDown, CheckCircle2 } from "lucide-react";
import { useExport, type ExportModule, type ExportFormat } from "@/features/export/api";
import { useAuth } from "@/providers/AuthProvider";
import { Role } from "@/lib/roles";

const MODULES: { value: ExportModule; label: string; roles: Role[] }[] = [
  { value: "profile", label: "My profile", roles: [Role.BUSINESS, Role.PROMOTER, Role.ADMIN] },
  { value: "campaigns", label: "My campaigns", roles: [Role.BUSINESS, Role.ADMIN] },
  { value: "promoters", label: "All promoters", roles: [Role.ADMIN] },
];

const FORMATS: { value: ExportFormat; label: string; icon: typeof FileText }[] = [
  { value: "csv", label: "CSV Data", icon: FileText },
  { value: "json", label: "JSON Data", icon: FileDown },
];

function ExportInner() {
  const { user } = useAuth();
  const [module, setModule] = useState<ExportModule>("profile");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const exp = useExport();

  const available = MODULES.filter((m) => !user || m.roles.includes(user.role));

  const go = () => {
    exp.mutate(
      { module, format },
      {
        onSuccess: () =>
          notifySuccess(
            <span>
              Exported —{" "}
              <a className="underline" href={exp.data?.downloadUrl} target="_blank" rel="noreferrer">
                download
              </a>
            </span> as any,
          ),
        onError: (e: any) => notifyError(e?.response?.data?.message ?? "Export failed"),
      },
    );
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Export data" subtitle="Download your data in CSV or JSON." />

      <Card className="space-y-6">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-fog">Module</label>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value as ExportModule)}
            className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none focus:border-primary"
          >
            {available.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-fog">Format</label>
          <div className="grid grid-cols-2 gap-3">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const active = format === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-5 transition-all ${
                    active
                      ? "border-signal-blue bg-signal-blue/5 text-signal-blue shadow-sm"
                      : "border-steel/10 text-ash hover:border-steel/20 hover:text-graphite"
                  }`}
                >
                  {active && <CheckCircle2 size={16} className="absolute right-3 top-3 text-signal-blue" />}
                  <Icon size={28} className="mb-2" />
                  <span className="text-sm font-bold">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={go} disabled={exp.isPending}>
            {exp.isPending ? (
              <span className="animate-pulse">Exporting…</span>
            ) : (
              <>
                <Download size={16} /> Export
              </>
            )}
          </Button>
        </div>
      </Card>

      {exp.data && (
        <Card className="bg-sky-wash p-4">
          <p className="text-body text-midnight-ink">
            Ready:{" "}
            <a
              className="font-medium text-primary underline"
              href={exp.data.downloadUrl}
              target="_blank"
              rel="noreferrer"
            >
              {exp.data.filename}
            </a>
          </p>
          <p className="mt-1 text-caption text-steel">
            Expires {new Date(exp.data.expiresAt).toLocaleString()}
          </p>
        </Card>
      )}
    </div>
  );
}

export default function ExportPage() {
  return (
    <RequireAuth>
      <ExportInner />
    </RequireAuth>
  );
}
