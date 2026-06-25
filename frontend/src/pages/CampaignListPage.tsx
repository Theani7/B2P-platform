import { useState } from "react";
import { Link } from "react-router-dom";
import { useCampaigns, useDeleteCampaign, useArchiveCampaign, useReopenCampaign } from "../features/campaigns/api";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import {
  Megaphone,
  Plus,
  Search,
  Edit3,
  Archive,
  Trash2,
  DollarSign,
  MapPin,
  CalendarDays,
  ArrowRight,
  RefreshCw,
  Filter,
} from "lucide-react";

export default function CampaignListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useCampaigns({ page, limit: 10, search: search || undefined });
  const deleteCampaign = useDeleteCampaign();
  const archiveCampaign = useArchiveCampaign();
  const reopenCampaign = useReopenCampaign();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-brand-coral-50 flex items-center justify-center mb-4 ring-1 ring-brand-coral/10">
        <Megaphone size={32} className="text-brand-coral" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading campaigns</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
    </div>
  );

  const handleDelete = async (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteCampaign.mutate(deleteConfirm.id, {
      onSuccess: () => { notifySuccess("Campaign deleted"); setDeleteConfirm(null); },
      onError: () => { notifyError("Failed to delete campaign"); setDeleteConfirm(null); },
    });
  };

  const handleArchive = async (id: string) => {
    archiveCampaign.mutate(id, {
      onSuccess: () => notifySuccess("Campaign archived"),
      onError: () => notifyError("Failed to archive campaign"),
    });
  };

  const handleReopen = async (id: string) => {
    reopenCampaign.mutate(id, {
      onSuccess: () => notifySuccess("Campaign reopened"),
      onError: () => notifyError("Failed to reopen campaign"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-brand-purple p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Megaphone size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-white">Campaigns</h1>
              <p className="text-sm text-white/70 mt-0.5">Manage your marketing campaigns</p>
            </div>
          </div>
          <Link
            to="/business/campaigns/create"
            className="bg-white text-brand-purple rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search campaigns..."
          aria-label="Search campaigns"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="block w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all"
        />
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Create your first campaign to start working with promoters."
          action={
            <Link
              to="/business/campaigns/create"
              className="inline-flex items-center gap-2 bg-brand-purple text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Create Campaign
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {data.items.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple-50 to-brand-indigo-50 flex items-center justify-center flex-shrink-0 ring-1 ring-brand-purple/10">
                        <Megaphone size={20} className="text-brand-purple" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/business/campaigns/${c.id}`}
                            className="text-base font-medium text-gray-900 truncate hover:text-brand-purple transition-colors"
                          >
                            {c.title}
                          </Link>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg ring-1 ring-gray-100">
                            <DollarSign size={11} className="text-brand-teal" />
                            ${c.budget.toLocaleString()}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin size={11} className="text-gray-400" />
                            {c.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarDays size={11} className="text-gray-400" />
                            {new Date(c.created_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric"
                            })}
                          </span>
                          {c.visibility && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                              <Filter size={10} />
                              {c.visibility}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/business/campaigns/${c.id}/edit`}
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-purple hover:border-brand-purple/30 hover:bg-brand-purple-50 transition-all"
                      >
                        <Edit3 size={15} />
                      </Link>
                      {c.status !== "ARCHIVED" && c.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleArchive(c.id)}
                          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-amber hover:border-brand-amber/30 hover:bg-brand-amber-50 transition-all"
                        >
                          <Archive size={15} />
                        </button>
                      )}
                      {c.status === "ARCHIVED" && (
                        <button
                          onClick={() => handleReopen(c.id)}
                          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-teal hover:border-brand-teal/30 hover:bg-brand-teal-50 transition-all"
                        >
                          <RefreshCw size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c.id, c.title)}
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-coral hover:border-brand-coral/30 hover:bg-brand-coral-50 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                      <Link
                        to={`/business/campaigns/${c.id}`}
                        className="w-9 h-9 rounded-xl bg-brand-purple-50 flex items-center justify-center text-brand-purple hover:bg-brand-purple-100 transition-all"
                      >
                        <ArrowRight size={15} />
                      </Link>
                    </div>
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
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Campaign"
        message={deleteConfirm ? `Delete "${deleteConfirm.title}"? This cannot be undone.` : ""}
      />
    </div>
  );
}
