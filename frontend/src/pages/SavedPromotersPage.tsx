import { useState } from "react";
import { Link } from "react-router-dom";
import { useSavedPromoters, useRemoveSavedPromoter } from "../features/discovery/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader, Avatar } from "../components/ui";
import {
  Search,
  Trash2,
  MapPin,
  Users,
  TrendingUp,
  Eye,
  Briefcase,
  BadgeCheck,
  UserPlus,
  ArrowRight,
  BookmarkX,
} from "lucide-react";

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

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-brand-coral-50 flex items-center justify-center mb-4 ring-1 ring-brand-coral/10">
        <BookmarkX size={32} className="text-brand-coral" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading saved promoters</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
    </div>
  );

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
      {/* Header */}
      <PageHeader
        title="Saved Promoters"
        description="Your shortlist of potential collaborators"
        actions={
          <Link
            to="/business/promoters"
            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <UserPlus size={16} />
            Browse Promoters
          </Link>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search saved promoters..."
          aria-label="Search saved promoters"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="block w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No saved promoters"
          description="Save promoters from the directory to build your shortlist."
          action={
            <Link
              to="/business/promoters"
              className="inline-flex items-center gap-2 bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <UserPlus size={16} />
              Discover Promoters
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((p: any) => (
              <div
                key={p.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors duration-150 group"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <Avatar initials={p.username?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={p.id?.charCodeAt(0) || 0} />
                      )}
                      {p.verified && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-teal flex items-center justify-center ring-2 ring-white">
                          <BadgeCheck size={10} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/promoters/${p.username}`}
                          className="truncate text-sm font-medium text-gray-900 hover:text-brand-purple transition-colors"
                        >
                          {p.username}
                        </Link>
                        {p.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-teal-50 text-brand-teal-900 ring-1 ring-brand-teal/10 flex-shrink-0">
                            <BadgeCheck size={10} />
                            Verified
                          </span>
                        )}
                      </div>
                      {p.headline && (
                        <p className="truncate text-xs text-gray-500 mt-0.5">{p.headline}</p>
                      )}

                      {/* Stats */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-700 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                          <Briefcase size={10} className="text-brand-amber" />
                          {p.niche}
                        </span>
                        {p.location && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={10} className="text-gray-400" />
                            {p.location}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Users size={11} className="text-gray-400" />
                          {p.followers_count?.toLocaleString()} followers
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp size={11} className="text-brand-teal" />
                          {p.engagement_rate?.toFixed(1)}% eng.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100">
                    <Link
                      to={`/promoters/${p.username}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-purple hover:border-brand-purple/30 transition-colors"
                    >
                      <Eye size={12} />
                      View
                    </Link>
                    <button
                      onClick={() => handleRemove(p.id, p.username)}
                      disabled={removeSaved.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-brand-coral-50 hover:text-brand-coral hover:border-brand-coral/30 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ArrowRight size={12} className="rotate-180" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      p === page
                        ? "bg-brand-indigo text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page >= data.pages}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
                <ArrowRight size={12} />
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
