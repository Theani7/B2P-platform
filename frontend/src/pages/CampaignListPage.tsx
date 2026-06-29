import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCampaigns, useDeleteCampaign, useArchiveCampaign, useReopenCampaign, usePublishCampaign } from "../features/campaigns/api";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { StatCard } from "../components/ui";
import { ExportButton } from "../components/export";
import {
  Megaphone, Plus, Search, Edit3, Archive, Trash2,
  MoreVertical, Eye, FolderDot, FolderOpen, Rocket
} from "lucide-react";
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

function ActionMenu({ campaign, onPublish, onArchive, onReopen, onDelete }: any) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setOpen(false));
  const navigate = useNavigate();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 text-fog hover:text-graphite rounded-button hover:bg-sky-wash transition-colors"
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
            className="absolute right-0 mt-1 w-48 bg-white border border-slate-custom/10 rounded-cards shadow-product-card z-50 overflow-hidden py-1"
          >
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/business/campaigns/${campaign.id}`); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-graphite hover:bg-sky-wash"
            >
              <Eye size={16} className="text-ash" /> View Details
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/business/campaigns/${campaign.id}/edit`); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-graphite hover:bg-sky-wash"
            >
              <Edit3 size={16} className="text-ash" /> Edit Campaign
            </button>

            <div className="h-px bg-slate-custom/10 my-1" />
            {campaign.status === "DRAFT" ? (
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onPublish(campaign.id); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-signal-blue hover:bg-sky-wash"
              >
                <Rocket size={16} className="text-signal-blue" /> Publish
              </button>
            ) : campaign.status !== "ARCHIVED" && campaign.status !== "CANCELLED" ? (
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onArchive(campaign.id); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-tag hover:bg-amber-tag/10"
              >
                <Archive size={16} className="text-amber-tag" /> Archive
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onReopen(campaign.id); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-signal-blue hover:bg-sky-wash"
              >
                <FolderOpen size={16} className="text-signal-blue" /> Reopen
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(campaign.id, campaign.title); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-coral-alert hover:bg-coral-alert/10"
            >
              <Trash2 size={16} className="text-coral-alert" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-signal-blue/10 text-signal-blue",
    ACTIVE: "bg-emerald-status/10 text-emerald-status",
    DRAFT: "bg-slate-custom/10 text-slate-custom",
    COMPLETED: "bg-signal-blue/10 text-signal-blue",
    CANCELLED: "bg-coral-alert/10 text-coral-alert",
    ARCHIVED: "bg-amber-tag/10 text-amber-tag",
  };
  const style = styles[status] || styles.DRAFT;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-badges text-[11px] font-medium ${style}`}>
      {status}
    </span>
  );
}

export default function CampaignListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const { data, isLoading, error } = useCampaigns({ page, limit: 10, search: search || undefined, status: statusFilter || undefined, location: locationFilter || undefined });
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

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-cards bg-coral-alert/10 flex items-center justify-center mb-4">
        <Megaphone size={32} className="text-coral-alert" />
      </div>
      <p className="text-heading text-graphite">Error loading campaigns</p>
      <p className="text-sm text-ash mt-2">{(error as Error).message}</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-lg text-midnight-ink">Campaigns</h1>
          <p className="text-body text-ash mt-2">Manage and track all your marketing campaigns.</p>
        </div>
        <div className="flex gap-3">
          <ExportButton module="campaigns" availableColumns={['id', 'title', 'status', 'budget', 'location']} />
          <Link
            to="/business/campaigns/create"
            className="inline-flex items-center gap-2 px-4 py-2 hero-blue-fade text-white rounded-button text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            Create Campaign
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={campaigns.length} icon={FolderDot} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign: any) => (
          <div
            key={campaign.id}
            onClick={() => navigate(`/business/campaigns/${campaign.id}`)}
            className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-5 cursor-pointer hover:border-signal-blue/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <StatusBadge status={campaign.status} />
              <ActionMenu
                campaign={campaign}
                onPublish={handlePublish}
                onArchive={handleArchive}
                onReopen={handleReopen}
                onDelete={handleDelete}
              />
            </div>
            <h3 className="text-sm font-medium text-graphite mb-2">{campaign.title}</h3>
            <p className="text-xs text-ash mb-4 line-clamp-2">{campaign.description}</p>
            <div className="flex items-center justify-between text-xs text-ash">
              <span>{campaign.budget ? `$${campaign.budget}` : 'No budget'}</span>
              <span>{campaign.location || 'Remote'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
