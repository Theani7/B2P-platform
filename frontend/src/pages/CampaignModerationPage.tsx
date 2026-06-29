import { useState } from "react";
import { useAdminCampaigns, useAdminArchiveCampaign, useAdminCancelCampaign } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { formatNepaliCurrency } from "../utils/currency";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-900",
  OPEN: "bg-brand-teal-50 text-brand-teal-900",
  ACTIVE: "bg-brand-purple-50 text-brand-purple-900",
  COMPLETED: "bg-stone-100 text-stone-900",
  ARCHIVED: "bg-brand-amber-50 text-brand-amber-900",
  CANCELLED: "bg-brand-coral-50 text-brand-coral-900",
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
      <h1 className="text-xl font-medium text-stone-900 font-stretch-condensed">Campaign Moderation</h1>

      <div className="flex flex-wrap gap-4">
        <input type="text" placeholder="Search campaigns..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="rounded-lg border border-stone-100 px-3 py-2 text-sm flex-1 min-w-[200px] text-stone-900" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-stone-100 px-3 py-2 text-sm text-stone-900">
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
            <div key={c.id} className="rounded-xl border border-stone-100 bg-white p-5 border-t-[1px] border-t-brand-purple">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-stone-900">{c.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-stone-500">
                    <span>{c.business_company_name}</span>
                    <span>&middot;</span>
                    <span>{c.category}</span>
                    <span>&middot;</span>
                    <span>{formatNepaliCurrency(c.budget)}</span>
                    <span>&middot;</span>
                    <span>{c.location}</span>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status] || ""}`}>{c.status}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
                <span>Created {new Date(c.created_at).toLocaleDateString()}</span>
                <div className="flex space-x-3">
                  {(c.status === "OPEN" || c.status === "ACTIVE") && (
                    <>
                      <button onClick={() => handleArchive(c.id)} className="text-brand-amber-900 hover:underline">Archive</button>
                      <button onClick={() => handleCancel(c.id)} className="text-brand-coral hover:underline">Cancel</button>
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
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-stone-100 bg-white px-3 py-1.5 text-sm text-stone-900 hover:bg-stone-50 disabled:opacity-50 transition-colors">Previous</button>
          <span className="text-sm text-stone-500">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-lg border border-stone-100 bg-white px-3 py-1.5 text-sm text-stone-900 hover:bg-stone-50 disabled:opacity-50 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}
