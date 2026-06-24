import { useState } from "react";
import { Link } from "react-router-dom";
import { useCampaigns, useDeleteCampaign, useArchiveCampaign } from "../features/campaigns/api";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function CampaignListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useCampaigns({ page, limit: 10, search: search || undefined });
  const deleteCampaign = useDeleteCampaign();
  const archiveCampaign = useArchiveCampaign();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteCampaign.mutate(id, {
      onSuccess: () => notifySuccess("Campaign deleted"),
      onError: () => notifyError("Failed to delete campaign"),
    });
  };

  const handleArchive = async (id: string) => {
    archiveCampaign.mutate(id, {
      onSuccess: () => notifySuccess("Campaign archived"),
      onError: () => notifyError("Failed to archive campaign"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Campaigns</h1>
        <Link
          to="/business/campaigns/create"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + New Campaign
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search campaigns..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="block w-full max-w-md rounded border border-gray-300 p-2"
      />

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Create your first campaign to start working with promoters."
          action={
            <Link
              to="/business/campaigns/create"
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Create Campaign
            </Link>
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-text">Title</th>
                  <th className="px-4 py-3 font-medium text-text">Status</th>
                  <th className="px-4 py-3 font-medium text-text">Budget</th>
                  <th className="px-4 py-3 font-medium text-text">Location</th>
                  <th className="px-4 py-3 font-medium text-text">Created</th>
                  <th className="px-4 py-3 font-medium text-text">Visibility</th>
                  <th className="px-4 py-3 font-medium text-text">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-text">{c.title}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">${c.budget.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{c.location}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{c.visibility}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/business/campaigns/${c.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                        <Link
                          to={`/business/campaigns/${c.id}/edit`}
                          className="text-sm text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        {c.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleArchive(c.id)}
                            className="text-sm text-yellow-600 hover:underline"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(c.id, c.title)}
                          className="text-sm text-danger hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {data.page} of {data.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page >= data.pages}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
