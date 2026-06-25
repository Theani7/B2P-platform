import { useState } from "react";
import { Link } from "react-router-dom";
import { useSavedPromoters, useRemoveSavedPromoter } from "../features/discovery/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import {
  Bookmark,
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-amber via-brand-amber-900 to-brand-purple-900 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shadow-lg ring-1 ring-white/20">
              <Bookmark size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-white">Saved Promoters</h1>
              <p className="text-sm text-white/70 mt-0.5">Your shortlist of potential collaborators</p>
            </div>
          </div>
          <Link
            to="/business/promoters"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
          >
            <UserPlus size={16} />
            Browse Promoters
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search saved promoters..."
          aria-label="Search saved promoters"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="block w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all"
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
              className="inline-flex items-center gap-2 bg-brand-purple text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
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
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-amber-50 to-brand-purple-50 flex items-center justify-center text-xl font-bold text-brand-purple-900 ring-1 ring-brand-amber/10 overflow-hidden">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          p.username?.[0]?.toUpperCase() ?? "?"
                        )}
                      </div>
                      {p.verified && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-teal flex items-center justify-center ring-2 ring-white">
                          <BadgeCheck size={12} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/promoters/${p.username}`}
                          className="truncate font-medium text-gray-900 hover:text-brand-purple transition-colors"
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
                        <p className="truncate text-sm text-gray-500 mt-0.5">{p.headline}</p>
                      )}

                      {/* Stats */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg ring-1 ring-gray-100">
                          <Briefcase size={10} className="text-brand-amber" />
                          {p.niche}
                        </span>
                        {p.location && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
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
                  <div className="mt-4 flex gap-2 pt-4 border-t border-gray-50">
                    <Link
                      to={`/promoters/${p.username}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-purple hover:border-brand-purple/30 transition-all"
                    >
                      <Eye size={14} />
                      View
                    </Link>
                    <button
                      onClick={() => handleRemove(p.id, p.username)}
                      disabled={removeSaved.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-brand-coral-50 hover:text-brand-coral hover:border-brand-coral/30 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <ArrowRight size={14} className="rotate-180" />
                Previous
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? "bg-brand-purple text-white"
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
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Next
                <ArrowRight size={14} />
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
