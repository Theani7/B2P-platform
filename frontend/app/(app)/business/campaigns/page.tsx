"use client";

import { useState, useEffect, useRef } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { StatusBadge, formatBudget } from "@/components/campaigns/StatusBadge";
import { NicheBadge } from "@/components/discovery/NicheBadge";
import { CampaignStatus } from "@/features/campaigns/types";
import {
  useCampaigns,
  useDeleteCampaign,
  useCampaignStatusAction,
  useCampaignDashboardStats,
  useUpdateCampaign,
} from "@/features/campaigns/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useRouter } from "next/navigation";
import {
  MegaphoneSimple,
  Plus,
  MagnifyingGlass,
  MapPin,
  CalendarBlank,
  DotsThreeVertical,
  Eye,
  PencilSimple,
  Archive,
  Trash,
  RocketLaunch,
  ArrowClockwise,
  XCircle,
  Broadcast,
  Handshake,
  NotePencil,
  X,
  CaretRight,
  WarningCircle,
} from "@phosphor-icons/react";

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

function ActionMenu({
  campaign,
  onPublish,
  onArchive,
  onReopen,
  onCancel,
  onDelete,
}: {
  campaign: any;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onReopen: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setOpen(false));
  const router = useRouter();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        aria-label="Campaign actions"
        className="p-1 text-fog hover:text-midnight-ink hover:bg-sky-wash rounded-lg transition-colors"
      >
        <DotsThreeVertical size={20} weight="bold" />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-1.5 w-48 bg-white border border-steel/15 rounded-xl shadow-xl z-50 overflow-hidden py-1 divide-y divide-steel/10"
        >
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push(`/business/campaigns/${campaign.id}`);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-graphite hover:bg-sky-wash transition-colors text-left"
            >
              <Eye size={15} weight="bold" className="text-ash" /> View Details
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push(`/business/campaigns/${campaign.id}/edit`);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-graphite hover:bg-sky-wash transition-colors text-left"
            >
              <PencilSimple size={15} weight="bold" className="text-ash" /> Edit Campaign
            </button>
          </div>
          <div className="py-1">
            {campaign.status === "DRAFT" ? (
              <button
                onClick={() => {
                  setOpen(false);
                  onPublish(campaign.id);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-signal-blue hover:bg-signal-blue/10 transition-colors text-left"
              >
                <RocketLaunch size={15} weight="bold" /> Publish
              </button>
            ) : campaign.status !== "ARCHIVED" && campaign.status !== "CANCELLED" ? (
              <>
                <button
                  onClick={() => {
                    setOpen(false);
                    onArchive(campaign.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-amber-tag hover:bg-amber-tag/10 transition-colors text-left"
                >
                  <Archive size={15} weight="bold" /> Archive
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    onCancel(campaign.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-coral-alert hover:bg-coral-alert/10 transition-colors text-left"
                >
                  <XCircle size={15} weight="bold" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  onReopen(campaign.id);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-signal-blue hover:bg-signal-blue/10 transition-colors text-left"
              >
                <ArrowClockwise size={15} weight="bold" /> Reopen
              </button>
            )}
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                onDelete(campaign.id, campaign.title);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-coral-alert hover:bg-coral-alert/10 transition-colors text-left"
            >
              <Trash size={15} weight="bold" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignsPageInner() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isSearchExpanded = isSearchOpen || search.trim().length > 0;
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!searchContainerRef.current) return;
      if (!searchContainerRef.current.contains(e.target as Node)) {
        if (!search.trim()) {
          setIsSearchOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [search]);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleCloseOrClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (search) {
      setSearch("");
      setPage(1);
      searchInputRef.current?.focus();
    } else {
      setIsSearchOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (search) {
        setSearch("");
        setPage(1);
      } else {
        setIsSearchOpen(false);
      }
    }
  };

  const { data, isLoading, error } = useCampaigns({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter || undefined,
  });
  const stats = useCampaignDashboardStats();

  const deleteCampaign = useDeleteCampaign();
  const archiveCampaign = useCampaignStatusAction("archive");
  const reopenCampaign = useCampaignStatusAction("reopen");
  const publishCampaign = useCampaignStatusAction("publish");
  const updateCampaign = useUpdateCampaign();

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (id: string, title: string) => setDeleteConfirm({ id, title });
  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteCampaign.mutate(deleteConfirm.id, {
      onSuccess: () => {
        notifySuccess("Campaign deleted");
        setDeleteConfirm(null);
      },
      onError: () => {
        notifyError("Failed to delete campaign");
        setDeleteConfirm(null);
      },
    });
  };

  const handleArchive = (id: string) =>
    archiveCampaign.mutate(id, {
      onSuccess: () => notifySuccess("Campaign archived"),
      onError: () => notifyError("Failed to archive campaign"),
    });

  const handleReopen = (id: string) =>
    reopenCampaign.mutate(id, {
      onSuccess: () => notifySuccess("Campaign reopened"),
      onError: () => notifyError("Failed to reopen campaign"),
    });

  const handleCancel = (id: string) =>
    updateCampaign.mutate(
      { id, data: { status: CampaignStatus.CANCELLED } },
      {
        onSuccess: () => notifySuccess("Campaign cancelled"),
        onError: () => notifyError("Failed to cancel campaign"),
      }
    );

  const handlePublish = (id: string) =>
    publishCampaign.mutate(id, {
      onSuccess: () => notifySuccess("Campaign published! It's now live on the marketplace."),
      onError: (e: any) => notifyError(e?.response?.data?.message || "Failed to publish campaign"),
    });

  const campaigns = data?.items || [];
  const totalCampaigns = data?.total || 0;
  const openCount = stats.data?.open_campaigns ?? 0;
  const draftCount = stats.data?.draft_campaigns ?? 0;
  const activeCount = stats.data?.active_campaigns ?? 0;
  const completedCount = stats.data?.completed_campaigns ?? 0;

  const TABS = [
    { key: "ALL", label: "All", count: stats.data?.total_campaigns ?? totalCampaigns },
    { key: "OPEN", label: "Open", count: openCount },
    { key: "ACTIVE", label: "Active", count: activeCount },
    { key: "DRAFT", label: "Drafts", count: draftCount },
    { key: "COMPLETED", label: "Completed", count: completedCount },
  ];

  const fmtDate = (s: string) => {
    if (!s) return "";
    try {
      return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-coral-alert/10 text-coral-alert flex items-center justify-center mb-4">
          <WarningCircle size={28} weight="bold" />
        </div>
        <p className="text-base font-bold text-graphite">Failed to load campaigns</p>
        <p className="text-xs text-ash mt-1.5 max-w-sm text-center">{(error as Error).message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-sky-wash text-signal-blue text-xs font-semibold rounded-pill hover:bg-signal-blue hover:text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto space-y-8 pb-20">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 120% at 100% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0) 60%)" }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-midnight-ink">
                My Campaigns
              </h1>
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-pill bg-sky-wash text-signal-blue border border-signal-blue/20">
                {stats.data?.total_campaigns ?? totalCampaigns}
              </span>
            </div>
            <p className="text-sm text-ash mt-2">
              Track performance, review applications, and manage campaign lifecycles.
            </p>
          </div>

          <button
            onClick={() => router.push("/business/campaigns/create")}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-signal-blue hover:bg-signal-blue/90 text-white rounded-pill text-sm font-semibold shadow-product-card transition-all hover:shadow-elevated self-start sm:self-auto"
          >
            <Plus size={16} weight="bold" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-signal-blue/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-sky-wash text-signal-blue flex items-center justify-center flex-shrink-0">
            <MegaphoneSimple size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Total Campaigns</p>
            <p className="text-2xl font-bold font-mono text-midnight-ink mt-0.5">
              {stats.data?.total_campaigns ?? totalCampaigns}
            </p>
          </div>
        </div>

        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-emerald-status/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-status/10 text-emerald-status flex items-center justify-center flex-shrink-0">
            <Broadcast size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Open for Apps</p>
            <p className="text-2xl font-bold font-mono text-midnight-ink mt-0.5">
              {openCount}
            </p>
          </div>
        </div>

        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-amber-tag/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-tag/15 text-amber-tag flex items-center justify-center flex-shrink-0">
            <Handshake size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Active Collabs</p>
            <p className="text-2xl font-bold font-mono text-midnight-ink mt-0.5">
              {activeCount}
            </p>
          </div>
        </div>

        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-steel/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-steel/10 text-ash flex items-center justify-center flex-shrink-0">
            <NotePencil size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Drafts</p>
            <p className="text-2xl font-bold font-mono text-midnight-ink mt-0.5">
              {draftCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-steel/10 rounded-2xl p-2.5 shadow-product-card flex items-center justify-between gap-3">
        <div
          className={`flex items-center gap-1.5 overflow-x-auto hide-scrollbar transition-all duration-300 ${
            isSearchExpanded ? "hidden sm:flex" : "flex"
          }`}
        >
          {TABS.map((tab) => {
            const isSelected = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-pill whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-midnight-ink text-white shadow-sm"
                    : "text-ash hover:text-graphite hover:bg-sky-wash/70"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-pill leading-none ${
                      isSelected ? "bg-white/20 text-white" : "bg-sky-wash text-ash"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Expandable Search Bar */}
        <div
          ref={searchContainerRef}
          onClick={() => {
            if (!isSearchExpanded) {
              handleOpenSearch();
            }
          }}
          className={`relative flex items-center h-9 rounded-pill transition-all duration-300 ease-in-out cursor-pointer ${
            isSearchExpanded
              ? "w-full sm:w-72 md:w-80 bg-white border border-signal-blue ring-2 ring-signal-blue/10 pl-3 pr-2 shadow-sm cursor-text"
              : "w-9 bg-linen-canvas border border-steel/15 text-ash hover:text-signal-blue hover:border-signal-blue/40 hover:bg-sky-wash/50 justify-center shadow-sm flex-shrink-0"
          }`}
        >
          <MagnifyingGlass
            size={16}
            weight="bold"
            className={`flex-shrink-0 transition-colors duration-200 ${
              isSearchExpanded ? "text-signal-blue" : "text-ash"
            }`}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onKeyDown={handleKeyDown}
            className={`h-full bg-transparent text-xs font-medium text-graphite placeholder:text-fog outline-none transition-all duration-200 ${
              isSearchExpanded
                ? "w-full pl-2.5 pr-1 opacity-100"
                : "w-0 p-0 opacity-0 pointer-events-none"
            }`}
            tabIndex={isSearchExpanded ? 0 : -1}
          />
          {isSearchExpanded && (
            <button
              onClick={handleCloseOrClear}
              aria-label="Close search"
              className="flex-shrink-0 p-1 rounded-full text-fog hover:text-graphite hover:bg-steel/10 transition-colors"
            >
              <X size={13} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <SkeletonCards count={6} />
      ) : campaigns.length === 0 ? (
        <div className="bg-white border border-steel/10 rounded-2xl p-12 shadow-product-card text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-wash text-signal-blue flex items-center justify-center mb-4">
            <MegaphoneSimple size={28} weight="bold" />
          </div>
          <h3 className="text-base font-bold text-graphite">
            {search || statusFilter !== "ALL"
              ? "No matching campaigns found"
              : "You haven't created any campaigns yet"}
          </h3>
          <p className="text-xs text-ash mt-1 max-w-sm leading-relaxed">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search terms or filter to see more campaigns."
              : "Launch a new campaign to discover, invite, and collaborate with top promoters."}
          </p>
          <div className="mt-5 flex items-center gap-3">
            {search || statusFilter !== "ALL" ? (
              <button
                onClick={() => {
                  setSearch("");
                  setIsSearchOpen(false);
                  setStatusFilter("ALL");
                  setPage(1);
                }}
                className="px-4 py-2 rounded-pill bg-sky-wash text-signal-blue text-xs font-semibold hover:bg-signal-blue hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            ) : null}
            <button
              onClick={() => router.push("/business/campaigns/create")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-blue text-white rounded-pill text-xs font-bold shadow-product-card hover:bg-signal-blue/90 transition-colors"
            >
              <Plus size={15} weight="bold" /> Create Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((campaign: any) => (
            <div
              key={campaign.id}
              onClick={() => router.push(`/business/campaigns/${campaign.id}`)}
              className="group bg-white border border-steel/10 rounded-2xl p-5 shadow-product-card hover:-translate-y-1 hover:border-signal-blue/30 hover:shadow-elevated transition-all duration-200 cursor-pointer flex flex-col justify-between relative"
            >
              {/* Header: Category + Status Badge on Left, Action Menu on Right */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {campaign.category && (
                      <NicheBadge niche={campaign.category} className="!py-0.5 !px-2 text-[10px]" />
                    )}
                    <StatusBadge status={campaign.status} />
                  </div>
                  <ActionMenu
                    campaign={campaign}
                    onPublish={handlePublish}
                    onArchive={handleArchive}
                    onReopen={handleReopen}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                  />
                </div>

                {/* Campaign Title & Description */}
                <h3 className="text-base font-bold text-graphite group-hover:text-signal-blue transition-colors line-clamp-1 mt-3">
                  {campaign.title}
                </h3>
                <p className="text-xs text-ash line-clamp-2 mt-1.5 leading-relaxed">
                  {campaign.description}
                </p>
              </div>

              {/* Bottom Metadata & Footer */}
              <div className="mt-4 pt-3.5 border-t border-steel/10 space-y-3">
                {/* Meta details with icons */}
                <div className="flex items-center gap-3.5 text-xs font-medium text-ash">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <MapPin size={13} weight="bold" className="text-signal-blue/80 flex-shrink-0" />
                    <span className="truncate max-w-[110px]">{campaign.location || "Remote"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 flex-shrink-0">
                    <CalendarBlank size={13} weight="bold" className="text-signal-blue/80 flex-shrink-0" />
                    <span>
                      {fmtDate(campaign.startDate)}
                      {campaign.endDate ? ` - ${fmtDate(campaign.endDate)}` : ""}
                    </span>
                  </span>
                </div>

                {/* Budget & Quick Action */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] font-semibold text-fog uppercase tracking-wider block">
                      Budget
                    </span>
                    <span className="text-sm font-bold font-mono text-midnight-ink">
                      {formatBudget(campaign.budget)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/business/campaigns/${campaign.id}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-sky-wash text-signal-blue group-hover:bg-signal-blue group-hover:text-white text-xs font-semibold transition-colors"
                  >
                    <span>Manage</span>
                    <CaretRight size={13} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 min-w-[32px] px-2.5 rounded-pill text-xs font-bold transition-colors ${
                p === page
                  ? "bg-signal-blue text-white shadow-sm"
                  : "text-ash hover:bg-sky-wash hover:text-graphite"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-steel/10">
            <div className="w-11 h-11 rounded-xl bg-coral-alert/10 text-coral-alert flex items-center justify-center mb-3">
              <Trash size={22} weight="bold" />
            </div>
            <h3 className="text-base font-bold text-graphite">Delete Campaign</h3>
            <p className="text-xs text-ash mt-1.5 leading-relaxed">
              Are you sure you want to delete <strong className="text-graphite">"{deleteConfirm.title}"</strong>?
              All associated applications, invitations, and data will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-pill text-xs font-semibold text-ash hover:text-graphite hover:bg-sky-wash transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-pill text-xs font-bold bg-coral-alert hover:bg-coral-alert/90 text-white shadow-sm transition-colors"
              >
                Delete Campaign
              </button>
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
