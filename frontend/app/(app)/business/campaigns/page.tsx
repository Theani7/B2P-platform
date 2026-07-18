"use client";

import { useState, useEffect, useRef } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/Stats";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge, formatBudget } from "@/components/campaigns/StatusBadge";
import { ExportButton } from "@/components/export/ExportButton";
import {
  useCampaigns,
  useDeleteCampaign,
  useArchiveCampaign,
  useReopenCampaign,
  usePublishCampaign,
  useCampaignDashboardStats,
  useUpdateCampaign,
} from "@/features/campaigns/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useRouter } from "next/navigation";
import {
  Megaphone, Plus, Search, Edit3, Archive, Trash2,
  MoreVertical, Eye, FolderDot, FolderOpen, Rocket,
  MapPin, Calendar, Users,
} from "lucide-react";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

function ActionMenu({ campaign, onPublish, onArchive, onReopen, onCancel, onDelete }: any) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setOpen(false));
  const router = useRouter();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 text-fog hover:text-signal-blue hover:bg-signal-blue/10 rounded-md transition-colors"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-custom/10 rounded-xl shadow-xl z-50 overflow-hidden py-1">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/business/campaigns/${campaign.id}`); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-graphite hover:bg-sky-wash transition-colors"
          >
            <Eye size={16} className="text-ash" /> View Details
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/business/campaigns/${campaign.id}`); }}
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
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onArchive(campaign.id); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-tag hover:bg-amber-tag/10 transition-colors"
              >
                <Archive size={16} /> Archive
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onCancel(campaign.id); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-coral-alert hover:bg-coral-alert/10 transition-colors"
              >
                <Trash2 size={16} /> Cancel
              </button>
            </>
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
        </div>
      )}
    </div>
  );
}

function CampaignsPageInner() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useCampaigns({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter || undefined,
  });
  const stats = useCampaignDashboardStats();

  const deleteCampaign = useDeleteCampaign();
  const archiveCampaign = useArchiveCampaign();
  const reopenCampaign = useReopenCampaign();
  const publishCampaign = usePublishCampaign();
  const updateCampaign = useUpdateCampaign();

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (id: string, title: string) => setDeleteConfirm({ id, title });
  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteCampaign.mutate(deleteConfirm.id, {
      onSuccess: () => { notifySuccess("Campaign deleted"); setDeleteConfirm(null); },
      onError: () => { notifyError("Failed to delete campaign"); setDeleteConfirm(null); },
    });
  };
  const handleArchive = (id: string) =>
    archiveCampaign.mutate(id, { onSuccess: () => notifySuccess("Campaign archived"), onError: () => notifyError("Failed to archive campaign") });
  const handleReopen = (id: string) =>
    reopenCampaign.mutate(id, { onSuccess: () => notifySuccess("Campaign reopened"), onError: () => notifyError("Failed to reopen campaign") });
  const handleCancel = (id: string) =>
    updateCampaign.mutate({ id, data: { status: "CANCELLED" as any } }, { onSuccess: () => notifySuccess("Campaign cancelled"), onError: () => notifyError("Failed to cancel campaign") });
  const handlePublish = (id: string) =>
    publishCampaign.mutate(id, {
      onSuccess: () => notifySuccess("Campaign published! It's now visible in the marketplace."),
      onError: (e: any) => notifyError(e?.response?.data?.message || "Failed to publish campaign"),
    });

  const campaigns = data?.items || [];
  const totalCampaigns = data?.total || 0;
  const openCount = stats.data?.open_campaigns ?? 0;
  const draftCount = stats.data?.draft_campaigns ?? 0;
  const activeCount = stats.data?.active_campaigns ?? 0;

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

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
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
          <button
            onClick={() => router.push("/business/campaigns/create")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-11 bg-signal-blue text-white rounded-inputs text-sm font-bold shadow-sm hover:bg-signal-blue/90 transition-colors"
          >
            <Plus size={18} /> Create Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={stats.data?.total_campaigns ?? totalCampaigns} />
        <StatCard label="Open for Apps" value={openCount} />
        <StatCard label="Active Collabs" value={activeCount} />
        <StatCard label="Drafts" value={draftCount} />
      </div>

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

      {isLoading ? (
        <SkeletonCards count={6} />
      ) : campaigns.length === 0 ? (
        <div className="bg-white border border-slate-custom/10 rounded-xl p-12 shadow-sm">
          <EmptyState
            title="No campaigns found"
            description={search || statusFilter ? "Try adjusting your search or filters." : "You haven't created any campaigns yet."}
            action={
              <button onClick={() => router.push("/business/campaigns/create")} className="inline-flex items-center gap-2 px-6 h-10 bg-signal-blue text-white rounded-inputs text-sm font-bold shadow-sm hover:bg-signal-blue/90 transition-colors mt-2">
                <Plus size={16} /> Create your first campaign
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign: any) => (
            <div
              key={campaign.id}
              onClick={() => router.push(`/business/campaigns/${campaign.id}`)}
              className="group bg-white border border-slate-custom/10 rounded-xl shadow-product-card hover:-translate-y-1 hover:border-signal-blue/30 hover:shadow-elevated transition-all duration-300 cursor-pointer flex flex-col h-[240px] overflow-hidden relative"
            >
              <div className={`h-1.5 w-full absolute top-0 left-0 ${campaign.status === "OPEN" ? "bg-signal-blue" : campaign.status === "ACTIVE" ? "bg-emerald-status" : "bg-slate-custom/20"}`} />
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3 mt-1">
                  <StatusBadge status={campaign.status} />
                  <ActionMenu
                    campaign={campaign}
                    onPublish={handlePublish}
                    onArchive={handleArchive}
                    onReopen={handleReopen}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                  />
                </div>
                <h3 className="text-base font-bold text-graphite mb-1.5 line-clamp-1 group-hover:text-signal-blue transition-colors">
                  {campaign.title}
                </h3>
                <p className="text-xs text-ash line-clamp-2 mb-4 flex-1">{campaign.description}</p>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-4 text-xs font-medium text-fog">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-ash" />
                      <span className="truncate max-w-[100px]">{campaign.location || "Remote"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-ash" />
                      <span>{fmtDate(campaign.startDate)}</span>
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-custom/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-fog uppercase tracking-wider">Budget</span>
                      <span className="text-sm font-bold text-graphite">{formatBudget(campaign.budget)}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/business/campaigns/${campaign.id}`); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-wash text-signal-blue border border-signal-blue/20 rounded-md text-xs font-bold hover:bg-signal-blue hover:text-white transition-colors"
                    >
                      <Users size={14} /> Apps
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-inputs text-xs font-bold transition-colors ${
                  p === page ? "bg-signal-blue text-white shadow-sm" : "text-ash hover:bg-sky-wash hover:text-graphite"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-cards p-6 max-w-md w-full shadow-xl">
            <h3 className="text-heading font-bold text-graphite">Delete Campaign</h3>
            <p className="text-sm text-ash mt-2">Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <RequireAuth role={Role.BUSINESS}>
      <CampaignsPageInner />
    </RequireAuth>
  );
}
