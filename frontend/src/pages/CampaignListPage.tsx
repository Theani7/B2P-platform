import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCampaigns, useDeleteCampaign, useArchiveCampaign, useReopenCampaign, usePublishCampaign } from "../features/campaigns/api";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { StatCard } from "../components/ui";
import { ExportButton } from "../components/export";
import EmptyState from "../components/EmptyState";
import { formatNepaliCurrency } from "../utils/currency";
import {
  Megaphone, Plus, Search, Edit3, Archive, Trash2,
  MoreVertical, Eye, FolderDot, FolderOpen, Rocket,
  MapPin, Calendar, CircleDot, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

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

function ActionMenu({ campaign, onPublish, onArchive, onReopen, onDelete }: any) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setOpen(false));
  const navigate = useNavigate();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 text-fog hover:text-signal-blue hover:bg-signal-blue/10 rounded-md transition-colors"
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
            className="absolute right-0 mt-1 w-48 bg-white border border-slate-custom/10 rounded-xl shadow-xl z-50 overflow-hidden py-1"
          >
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/business/campaigns/${campaign.id}`); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-graphite hover:bg-sky-wash transition-colors"
            >
              <Eye size={16} className="text-ash" /> View Details
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/business/campaigns/${campaign.id}/edit`); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-graphite hover:bg-sky-wash transition-colors"
            >
              <Edit3 size={16} className="text-ash" /> Edit Campaign
            </button>

            <div className="h-px bg-slate-custom/10 my-1" />
            {campaign.status === "DRAFT" ? (
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onPublish(campaign.id); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-signal-blue hover:bg-signal-blue/5 transition-colors"
              >
                <Rocket size={16} /> Publish
              </button>
            ) : campaign.status !== "ARCHIVED" && campaign.status !== "CANCELLED" ? (
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onArchive(campaign.id); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-tag hover:bg-amber-tag/10 transition-colors"
              >
                <Archive size={16} /> Archive
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onReopen(campaign.id); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-signal-blue hover:bg-signal-blue/5 transition-colors"
              >
                <FolderOpen size={16} /> Reopen
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(campaign.id, campaign.title); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-coral-alert hover:bg-coral-alert/10 transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-signal-blue/10 text-signal-blue border-signal-blue/20",
    ACTIVE: "bg-emerald-status/10 text-emerald-status border-emerald-status/20",
    DRAFT: "bg-slate-custom/5 text-ash border-slate-custom/10",
    COMPLETED: "bg-graphite/10 text-graphite border-graphite/20",
    CANCELLED: "bg-coral-alert/10 text-coral-alert border-coral-alert/20",
    ARCHIVED: "bg-amber-tag/10 text-amber-tag border-amber-tag/20",
  };
  const style = styles[status] || styles.DRAFT;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style}`}>
      <CircleDot size={10} className="mr-1" />
      {status}
    </span>
  );
}

export default function CampaignListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useCampaigns({ 
    page, 
    limit: 12, 
    search: debouncedSearch || undefined, 
    status: statusFilter === "ALL" ? undefined : statusFilter || undefined 
  });

  const deleteCampaign = useDeleteCampaign();
  const archiveCampaign = useArchiveCampaign();
  const reopenCampaign = useReopenCampaign();
  const publishCampaign = usePublishCampaign();
  
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
  
  const handlePublish = async (id: string) => {
    publishCampaign.mutate(id, {
      onSuccess: () => notifySuccess("Campaign published! It's now visible in the marketplace."),
      onError: (e) => notifyError(e.message || "Failed to publish campaign"),
    });
  };

  const campaigns = data?.items || [];
  const totalCampaigns = data?.total || 0;
  
  // Calculate stats (rough estimate based on current page if not full list, but good enough for UI)
  const openCount = campaigns.filter((c: any) => c.status === "OPEN").length;
  const draftCount = campaigns.filter((c: any) => c.status === "DRAFT").length;
  const activeCount = campaigns.filter((c: any) => c.status === "ACTIVE").length;

  const TABS = ["ALL", "DRAFT", "OPEN", "ACTIVE", "COMPLETED"];

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-full bg-coral-alert/10 flex items-center justify-center mb-4">
        <Megaphone size={32} className="text-coral-alert" />
      </div>
      <p className="text-lg font-bold text-graphite">Error loading campaigns</p>
      <p className="text-sm text-ash mt-2">{(error as Error).message}</p>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-slate-custom/10 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-signal-blue/10 text-signal-blue rounded-xl flex items-center justify-center shadow-sm">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-graphite">My Campaigns</h1>
            <p className="text-sm text-ash mt-0.5">Manage, track, and publish your marketing campaigns.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <ExportButton module="campaigns" data={campaigns} availableColumns={['title', 'status', 'budget', 'location']} />
          <Link
            to="/business/campaigns/create"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-11 bg-signal-blue text-white rounded-inputs text-sm font-bold shadow-sm hover:bg-signal-blue/90 transition-colors"
          >
            <Plus size={18} />
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={totalCampaigns} icon={FolderDot} />
        <StatCard label="Open for Apps" value={openCount} icon={FolderOpen} />
        <StatCard label="Active Collabs" value={activeCount} icon={Rocket} />
        <StatCard label="Drafts" value={draftCount} icon={Edit3} />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-white border border-slate-custom/10 p-1 rounded-inputs shadow-sm overflow-x-auto hide-scrollbar w-full sm:w-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${
                (statusFilter === tab || (!statusFilter && tab === "ALL"))
                  ? "bg-sky-wash text-signal-blue"
                  : "text-ash hover:text-graphite hover:bg-slate-custom/5"
              }`}
            >
              {tab === "ALL" ? "All Campaigns" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-slate-custom/10 rounded-inputs focus:border-signal-blue focus:ring-1 focus:ring-signal-blue outline-none transition-shadow shadow-sm"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[220px] bg-sky-wash/50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white border border-slate-custom/10 rounded-xl p-12 shadow-sm">
          <EmptyState
            title="No campaigns found"
            description={search || statusFilter ? "Try adjusting your search or filters." : "You haven't created any campaigns yet."}
            action={
              <Link to="/business/campaigns/create" className="inline-flex items-center gap-2 px-6 h-10 bg-signal-blue text-white rounded-inputs text-sm font-bold shadow-sm hover:bg-signal-blue/90 transition-colors mt-2">
                <Plus size={16} />
                Create your first campaign
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign: any) => (
            <div
              key={campaign.id}
              onClick={() => navigate(`/business/campaigns/${campaign.id}`)}
              className="group bg-white border border-slate-custom/10 rounded-xl shadow-sm hover:border-signal-blue/30 hover:shadow-md transition-all cursor-pointer flex flex-col h-[240px] overflow-hidden relative"
            >
              {/* Card Header Background Gradient based on status */}
              <div className={`h-1.5 w-full absolute top-0 left-0 ${campaign.status === 'OPEN' ? 'bg-signal-blue' : campaign.status === 'ACTIVE' ? 'bg-emerald-status' : 'bg-slate-custom/20'}`} />
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3 mt-1">
                  <StatusBadge status={campaign.status} />
                  <ActionMenu
                    campaign={campaign}
                    onPublish={handlePublish}
                    onArchive={handleArchive}
                    onReopen={handleReopen}
                    onDelete={handleDelete}
                  />
                </div>
                
                <h3 className="text-base font-bold text-graphite mb-1.5 line-clamp-1 group-hover:text-signal-blue transition-colors">
                  {campaign.title}
                </h3>
                
                <p className="text-xs text-ash line-clamp-2 mb-4 flex-1">
                  {campaign.description}
                </p>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-4 text-xs font-medium text-fog">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-ash" />
                      <span className="truncate max-w-[100px]">{campaign.location || 'Remote'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-ash" />
                      <span>{new Date(campaign.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-custom/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-fog uppercase tracking-wider">Budget</span>
                      <span className="text-sm font-bold text-graphite">
                        {campaign.budget ? formatNepaliCurrency(campaign.budget) : 'Unpaid'}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/business/campaigns/${campaign.id}/applications`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-wash text-signal-blue border border-signal-blue/20 rounded-md text-xs font-bold hover:bg-signal-blue hover:text-white transition-colors"
                      title="View Applications"
                    >
                      <Users size={14} />
                      Apps
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-inputs text-xs font-bold transition-colors ${
                  p === page
                    ? "bg-signal-blue text-white shadow-sm"
                    : "text-ash hover:bg-sky-wash hover:text-graphite"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}
