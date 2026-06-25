import { useState } from "react";
import { useAdminCampaigns, useAdminArchiveCampaign, useAdminCancelCampaign } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  OPEN: "bg-green-100 text-green-700",
  ACTIVE: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-purple-100 text-purple-700",
  ARCHIVED: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
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
      <h1 className="text-2xl font-bold text-text">Campaign Moderation</h1>

      <div className="flex flex-wrap gap-4">
        <input type="text" placeholder="Search campaigns..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="rounded border px-3 py-2 text-sm flex-1 min-w-[200px]" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded border px-3 py-2 text-sm">
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
            <div key={c.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text">{c.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                    <span>{c.business_company_name}</span>
                    <span>&middot;</span>
                    <span>{c.category}</span>
                    <span>&middot;</span>
                    <span>${c.budget.toLocaleString()}</span>
                    <span>&middot;</span>
                    <span>{c.location}</span>
                  </div>
                </div>
                <span className={`rounded px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status] || ""}`}>{c.status}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>Created {new Date(c.created_at).toLocaleDateString()}</span>
                <div className="flex space-x-3">
                  {(c.status === "OPEN" || c.status === "ACTIVE") && (
                    <>
                      <button onClick={() => handleArchive(c.id)} className="text-yellow-600 hover:underline">Archive</button>
                      <button onClick={() => handleCancel(c.id)} className="text-danger hover:underline">Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
