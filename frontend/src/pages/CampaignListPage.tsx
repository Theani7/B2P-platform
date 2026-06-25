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
import { PageHeader } from "../components/ui";

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
      <PageHeader
        title="Campaigns"
        description="Manage your marketing campaigns"
        actions={
          <Link
            to="/business/campaigns/create"
            className="bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={16} />
            New Campaign
          </Link>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search campaigns..."
          aria-label="Search campaigns"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="block w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
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
              className="inline-flex items-center gap-2 bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
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
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors duration-150 group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-brand-purple-50 flex items-center justify-center flex-shrink-0 text-brand-purple-900">
                        <Megaphone size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/business/campaigns/${c.id}`}
                            className="text-sm font-medium text-gray-900 truncate hover:text-brand-purple transition-colors"
                          >
                            {c.title}
                          </Link>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                            <DollarSign size={10} className="text-brand-teal" />
                            ${c.budget.toLocaleString()}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={10} className="text-gray-400" />
                            {c.location}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <CalendarDays size={10} className="text-gray-400" />
                            {new Date(c.created_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric"
                            })}
                          </span>
                          {c.visibility && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
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
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-purple hover:border-brand-purple/30 hover:bg-brand-purple-50 transition-colors"
                      >
                        <Edit3 size={14} />
                      </Link>
                      {c.status !== "ARCHIVED" && c.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleArchive(c.id)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-amber hover:border-brand-amber/30 hover:bg-brand-amber-50 transition-colors"
                        >
                          <Archive size={14} />
                        </button>
                      )}
                      {c.status === "ARCHIVED" && (
                        <button
                          onClick={() => handleReopen(c.id)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-teal hover:border-brand-teal/30 hover:bg-brand-teal-50 transition-colors"
                        >
                          <RefreshCw size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c.id, c.title)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-coral hover:border-brand-coral/30 hover:bg-brand-coral-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      <Link
                        to={`/business/campaigns/${c.id}`}
                        className="w-8 h-8 rounded-lg bg-brand-purple-50 flex items-center justify-center text-brand-purple-900 hover:bg-brand-purple-100 transition-colors"
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
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
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Campaign"
        message={deleteConfirm ? `Delete "${deleteConfirm.title}"? This cannot be undone.` : ""}
      />
    </div>
  );
}
