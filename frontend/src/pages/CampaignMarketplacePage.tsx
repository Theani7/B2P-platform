import { useState } from "react";
import { useCampaignMarketplace, useApplyToCampaign } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function CampaignMarketplacePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("created_at");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState("");

  const { data, isLoading } = useCampaignMarketplace({
    search: search || undefined,
    page,
    limit: 12,
    sort,
  });

  const applyMutation = useApplyToCampaign();

  const handleApply = () => {
    if (!selectedCampaignId) return;
    applyMutation.mutate(
      { campaignId: selectedCampaignId, message: applyMessage || undefined },
      {
        onSuccess: () => {
          notifySuccess("Application submitted successfully");
          setShowApplyModal(false);
          setApplyMessage("");
          setSelectedCampaignId(null);
        },
        onError: (e) => notifyError(e.message),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Campaign Marketplace</h1>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search campaigns by title, description, category, or location..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="block flex-1 rounded-lg border border-gray-300 p-3 text-sm"
        />
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="rounded border border-gray-300 p-2 text-sm"
        >
          <option value="created_at">Newest</option>
          <option value="budget">Budget</option>
          <option value="title">Title</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No campaigns found"
          description="There are no open public campaigns available right now."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((c) => (
              <div key={c.id} className="rounded-lg border bg-white p-4 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {c.category}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    ${c.budget.toLocaleString()}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-text">{c.title}</h3>
                <p className="mt-1 text-sm text-gray-500">by {c.business_name}</p>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">{c.description}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <span>{c.location}</span>
                  <span>&middot;</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCampaignId(c.id);
                    setShowApplyModal(true);
                  }}
                  className="mt-4 w-full rounded bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>

          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {data.page} of {data.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page >= data.pages}
                className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold text-text">Apply to Campaign</h2>
            <textarea
              placeholder="Optional message to the business..."
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              className="mt-4 w-full rounded border border-gray-300 p-3 text-sm"
              rows={4}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => { setShowApplyModal(false); setApplyMessage(""); setSelectedCampaignId(null); }}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applyMutation.isPending}
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
