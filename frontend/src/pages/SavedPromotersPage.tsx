import { useState } from "react";
import { Link } from "react-router-dom";
import { useSavedPromoters, useRemoveSavedPromoter } from "../features/discovery/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function SavedPromotersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useSavedPromoters({
    search: search || undefined,
    page,
    limit: 12,
  });

  const removeSaved = useRemoveSavedPromoter();
  const [removeConfirm, setRemoveConfirm] = useState<{ id: string; username: string } | null>(null);

  if (error) return <div className="text-center py-12"><p className="text-danger">Error loading data</p><p className="text-gray-500 text-sm">{(error as Error).message}</p></div>;

  const handleRemove = (id: string, username: string) => {
    setRemoveConfirm({ id, username });
  };

  const confirmRemove = () => {
    if (!removeConfirm) return;
    removeSaved.mutate(removeConfirm.id, {
      onSuccess: () => { notifySuccess(`${removeConfirm.username} removed from shortlist`); setRemoveConfirm(null); },
      onError: (e) => { notifyError(e.message); setRemoveConfirm(null); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Saved Promoters</h1>
        <Link
          to="/business/promoters"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Browse Promoters
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search saved promoters..."
        aria-label="Search saved promoters"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="block w-full max-w-md rounded border border-gray-300 p-2 text-sm"
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No saved promoters"
          description="Save promoters from the directory to build your shortlist."
          action={
            <Link
              to="/business/promoters"
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Discover Promoters
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((p) => (
              <div key={p.id} className="rounded-lg border bg-white p-4 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      p.username[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/promoters/${p.username}`}
                        className="truncate font-semibold text-text hover:text-primary"
                      >
                        {p.username}
                      </Link>
                      {p.verified && (
                        <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                          Verified
                        </span>
                      )}
                    </div>
                    {p.headline && (
                      <p className="truncate text-sm text-gray-600">{p.headline}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium">{p.niche}</span>
                    {p.location && <span>{p.location}</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{p.followers_count.toLocaleString()} followers</span>
                    <span>{p.engagement_rate.toFixed(1)}% eng.</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/promoters/${p.username}`}
                    className="flex-1 rounded border border-primary py-1.5 text-center text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleRemove(p.id, p.username)}
                    disabled={removeSaved.isPending}
                    aria-label={`Remove ${p.username}`}
                    className="rounded border border-danger px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
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

      <ConfirmDialog
        isOpen={!!removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        onConfirm={confirmRemove}
        title="Remove Promoter"
        message={removeConfirm ? `Remove ${removeConfirm.username} from your shortlist?` : ""}
      />
    </div>
  );
}
