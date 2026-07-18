"use client";

import { useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { notifySuccess, notifyError } from "@/lib/notify";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAdminCampaigns, useArchiveCampaign, useCancelCampaign } from "@/features/admin/api";

const STATUS_TONE: Record<string, any> = {
  DRAFT: "slate",
  OPEN: "emerald",
  ACTIVE: "signal",
  COMPLETED: "amber",
  ARCHIVED: "coral",
  CANCELLED: "coral",
};

function CampaignsInner() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [actionCampaign, setActionCampaign] = useState<{ id: string, title: string, type: "archive" | "cancel" } | null>(null);

  const { data, isFetching } = useAdminCampaigns({
    page,
    limit: 15,
    search: search || undefined,
    status: status || undefined,
  });
  const archive = useArchiveCampaign();
  const cancel = useCancelCampaign();

  const act = (fn: any, id: string, ok: string) =>
    fn.mutate(id, { onSuccess: () => notifySuccess(ok), onError: (e: any) => notifyError(e?.response?.data?.message ?? "Failed") });

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      <PageHeader title="Campaigns" subtitle="Moderate campaigns across the platform." />
      <Card className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input placeholder="Search title" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink">
            <option value="">All statuses</option>
            {Object.keys(STATUS_TONE).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      {isFetching && !data ? <Spinner full /> : null}

      <div className="space-y-2">
        {(data?.items ?? []).map((c) => (
          <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/business/campaigns/${c.id}`} className="text-body font-medium text-midnight-ink hover:underline">{c.title}</Link>
                <Badge tone={STATUS_TONE[c.status] ?? "slate"}>{c.status}</Badge>
              </div>
              <p className="text-caption text-slate-custom">{c.businessCompanyName} · {c.category} · {c.location} · Rs. {new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(c.budget) || 0)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setActionCampaign({ id: c.id, title: c.title, type: "archive" })}>Archive</Button>
              <Button variant="danger" onClick={() => setActionCampaign({ id: c.id, title: c.title, type: "cancel" })}>Cancel</Button>
            </div>
          </Card>
        ))}
        {data && data.items.length === 0 && <Card><p className="text-body text-slate-custom">No campaigns found.</p></Card>}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span className="text-caption text-steel">Page {data?.page ?? page} of {data?.pages ?? 1}</span>
        <Button variant="ghost" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>

      <ConfirmModal
        isOpen={!!actionCampaign}
        title={actionCampaign?.type === "archive" ? "Archive Campaign" : "Cancel Campaign"}
        message={actionCampaign?.type === "archive" 
          ? `Are you sure you want to archive "${actionCampaign?.title}"? Archiving hides the campaign but preserves its data.`
          : `Are you sure you want to cancel "${actionCampaign?.title}"? This will terminate all active progress.`
        }
        confirmText={actionCampaign?.type === "archive" ? "Archive" : "Cancel Campaign"}
        isDanger={actionCampaign?.type === "cancel"}
        onCancel={() => setActionCampaign(null)}
        onConfirm={() => {
          if (actionCampaign) {
            if (actionCampaign.type === "archive") act(archive, actionCampaign.id, "Archived");
            else act(cancel, actionCampaign.id, "Cancelled");
          }
          setActionCampaign(null);
        }}
      />
    </div>
  );
}

export default function AdminCampaignsPage() {
  return (
    <RequireAuth role={Role.ADMIN}>
      <CampaignsInner />
    </RequireAuth>
  );
}
