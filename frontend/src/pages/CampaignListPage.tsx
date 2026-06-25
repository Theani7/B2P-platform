import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCampaigns, useDeleteCampaign, useArchiveCampaign, useReopenCampaign, useCampaignDashboardStats } from "../features/campaigns/api";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { StatCard } from "../components/ui";
import {
  Megaphone, Plus, Search, Edit3, Archive, Trash2, MapPin, 
  CalendarDays, Filter, MoreVertical, Copy, Eye, SlidersHorizontal,
  FolderDot, FolderOpen, DollarSign, CheckCircle2, ChevronLeft, ChevronRight
} from "lucide-react";
import { formatNepaliCurrency } from "../utils/currency";
import { motion, AnimatePresence } from "framer-motion";

function useClickOutside(ref: any, handler: () => void) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

function ActionMenu({ campaign, onArchive, onReopen, onDelete }: any) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setOpen(false));
  const navigate = useNavigate();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
      >
        <MoreVertical size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-50 overflow-hidden py-1"
          >
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/business/campaigns/${campaign.id}`); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye size={16} className="text-gray-400" /> View Details
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/business/campaigns/${campaign.id}/edit`); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit3 size={16} className="text-gray-400" /> Edit Campaign
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); notifySuccess("Campaign duplicated (mock)"); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Copy size={16} className="text-gray-400" /> Duplicate
            </button>
            <div className="h-px bg-gray-100 my-1" />
            {campaign.status !== "ARCHIVED" && campaign.status !== "CANCELLED" ? (
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onArchive(campaign.id); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
              >
                <Archive size={16} className="text-amber-500" /> Archive
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onReopen(campaign.id); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50"
              >
                <FolderOpen size={16} className="text-primary-500" /> Reopen
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(campaign.id, campaign.title); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} className="text-red-500" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PremiumBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-blue-50 text-blue-700 ring-blue-600/20",
    ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    DRAFT: "bg-gray-50 text-gray-700 ring-gray-600/20",
    COMPLETED: "bg-purple-50 text-purple-700 ring-purple-600/20",
    CANCELLED: "bg-red-50 text-red-700 ring-red-600/20",
    ARCHIVED: "bg-orange-50 text-orange-700 ring-orange-600/20",
  };
  const style = styles[status] || styles.DRAFT;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ring-1 ring-inset ${style}`}>
      {status}
    </span>
  );
}

export default function CampaignListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useCampaigns({ page, limit: 10, search: search || undefined });
  const { data: stats, isLoading: statsLoading } = useCampaignDashboardStats();
  const deleteCampaign = useDeleteCampaign();
  const archiveCampaign = useArchiveCampaign();
  const reopenCampaign = useReopenCampaign();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (id: string, title: string) => setDeleteConfirm({ id, title });
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

  const getInitialsColor = (title: string) => {
    const colors = ["bg-primary-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-rose-500"];
    const index = title.length % colors.length;
    return colors[index];
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 ring-1 ring-red-500/10">
        <Megaphone size={32} className="text-red-500" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading campaigns</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all your marketing campaigns.</p>
        </div>
        <Link
          to="/business/campaigns/create"
          className="inline-flex items-center gap-2 bg-primary-600 text-white rounded-lg h-10 px-4 text-sm font-medium shadow-sm hover:bg-primary-700 transition-all"
        >
          <Plus size={16} />
          Create Campaign
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Campaigns"
          value={statsLoading ? "—" : stats?.total_campaigns ?? 0}
          icon={FolderDot}
        />
        <StatCard
          label="Open Campaigns"
          value={statsLoading ? "—" : stats?.open_campaigns ?? 0}
          icon={FolderOpen}
        />
        <StatCard
          label="Active Campaigns"
          value={statsLoading ? "—" : stats?.active_campaigns ?? 0}
          icon={CheckCircle2}
        />
        <StatCard
          label="Avg Budget"
          value={statsLoading ? "—" : "Rs. 45K"} // Mocked as API doesn't return total budget currently
          icon={DollarSign}
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-2 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 h-9 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="hidden lg:flex items-center gap-2 pr-2 border-l border-gray-100 pl-4">
          <button className="h-8 px-3 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
            <Filter size={14} /> Status
          </button>
          <button className="h-8 px-3 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
            <MapPin size={14} /> Location
          </button>
          <button className="h-8 px-3 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
            <SlidersHorizontal size={14} /> More Filters
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex-1 p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="w-24 h-6 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 ring-1 ring-gray-900/5">
              <Megaphone size={28} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No campaigns found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Get started by creating a new marketing campaign to attract promoters.
            </p>
            <Link
              to="/business/campaigns/create"
              className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white rounded-lg h-9 px-4 text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Create Campaign
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4 lg:col-span-4">Campaign</div>
              <div className="col-span-2 lg:col-span-2">Status</div>
              <div className="col-span-2 lg:col-span-2">Budget</div>
              <div className="col-span-2 lg:col-span-2">Location</div>
              <div className="col-span-2 lg:col-span-2 text-right">Actions</div>
            </div>
            <div className="flex-1 divide-y divide-gray-100 bg-white">
              {data.items.map((c: any) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ y: -1, backgroundColor: "#F8FAFC" }}
                  onClick={() => navigate(`/business/campaigns/${c.id}`)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 cursor-pointer group transition-all"
                >
                  <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-semibold shadow-sm ${getInitialsColor(c.title)}`}>
                      {c.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{c.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{c.category || "Uncategorized"} • Created {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <PremiumBadge status={c.status} />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    {formatNepaliCurrency(c.budget)}
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={14} className="text-gray-400" />
                    {c.location || "Anywhere"}
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/business/campaigns/${c.id}`); }}
                      className="hidden lg:flex items-center justify-center h-8 px-3 rounded-md text-xs font-medium bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      View
                    </button>
                    <ActionMenu
                      campaign={c}
                      onArchive={handleArchive}
                      onReopen={handleReopen}
                      onDelete={handleDelete}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Pagination */}
            {data.pages > 0 && (
              <div className="border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing <span className="font-medium text-gray-900">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * 10, data.total || page * 10)}</span> of <span className="font-medium text-gray-900">{data.total || "?"}</span> campaigns
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
