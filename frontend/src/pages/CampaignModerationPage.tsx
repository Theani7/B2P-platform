import { useState } from "react";
import { useAdminCampaigns, useAdminArchiveCampaign, useAdminCancelCampaign } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { formatNepaliCurrency } from "../utils/currency";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-sky-wash text-graphite",
  OPEN: "bg-emerald-status/10 text-emerald-status",
  ACTIVE: "bg-signal-blue/10 text-signal-blue",
  COMPLETED: "bg-sky-wash text-graphite",
  ARCHIVED: "bg-amber-tag/10 text-amber-tag",
  CANCELLED: "bg-coral-alert/10 text-coral-alert",
};

export default function CampaignModerationPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useAdminCampaigns({ page, limit: 20, search: search || undefined, status: statusFilter || undefined });
  const archiveCamp = useAdminArchiveCampaign();
  const cancelCamp = useAdminCancelCampaign();

  if (isLoading) return <LoadingSpinner />;

  const handleArchive = (id: string) => {
    archiveCamp.mutate(id, { onSuccess: () => notifySuccess("Campaign archived"), onError: () => notifyError("Failed to archive") });
  };

  const handleCancel = (id: string) => {
    if (!confirm("Cancel this campaign?")) return;
    cancelCamp.mutate(id, { onSuccess: () => notifySuccess("Campaign cancelled"), onError: () => notifyError("Failed to cancel") });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-heading text-graphite">Campaign Moderation</h1>

      <div className="flex flex-wrap gap-4">
        <input type="text" placeholder="Search campaigns..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="rounded-inputs border border-slate-custom/10 px-3 py-2 text-sm flex-1 min-w-[200px] text-graphite" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-inputs border border-slate-custom/10 px-3 py-2 text-sm text-graphite">
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Open</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState title="No campaigns" description="No campaigns found." />
      ) : (
        <div className="space-y-4">
          {data.items.map((c) => (
            <div key={c.id} className="rounded-cards border border-slate-custom/10 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-graphite">{c.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-ash">
                    <span>{c.business_company_name}</span>
                    <span>&middot;</span>
                    <span>{c.category}</span>
                    <span>&middot;</span>
                    <span>{formatNepaliCurrency(c.budget)}</span>
                    <span>&middot;</span>
                    <span>{c.location}</span>
                  </div>
                </div>
                <span className={`rounded-badges px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status] || ""}`}>{c.status}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-fog">
                <span>Created {new Date(c.created_at).toLocaleDateString()}</span>
                <div className="flex space-x-3">
                  {(c.status === "OPEN" || c.status === "ACTIVE") && (
                    <>
                      <button onClick={() => handleArchive(c.id)} className="text-amber-tag hover:underline">Archive</button>
                      <button onClick={() => handleCancel(c.id)} className="text-coral-alert hover:underline">Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-inputs border border-slate-custom/10 bg-white px-3 py-1.5 text-sm text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Previous</button>
          <span className="text-sm text-ash">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-inputs border border-slate-custom/10 bg-white px-3 py-1.5 text-sm text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}
