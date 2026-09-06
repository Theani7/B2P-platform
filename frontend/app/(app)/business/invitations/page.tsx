"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";
import { SkeletonList } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { NicheBadge } from "@/components/discovery/NicheBadge";
import { formatBudget } from "@/components/campaigns/StatusBadge";
import { useBusinessInvitations, useCancelInvitation } from "@/features/invitations/api";
import { useRouter } from "next/navigation";
import {
  PaperPlaneTilt,
  HourglassSimple,
  CheckCircle,
  TrendUp,
  MagnifyingGlass,
  X,
  Users,
  Eye,
  Handshake,
  XCircle,
  ChatCircleDots,
  MapPin,
  CalendarBlank,
  WarningCircle,
  Plus,
  CaretRight,
  CaretLeft,
} from "@phosphor-icons/react";

function InvitationStatusBadge({ status }: { status: string }) {
  const norm = (status || "").toUpperCase();
  const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    ACCEPTED: { bg: "bg-emerald-status/10", text: "text-emerald-status", dot: "bg-emerald-status", label: "Accepted" },
    PENDING: { bg: "bg-amber-tag/15", text: "text-amber-tag", dot: "bg-amber-tag animate-pulse", label: "Pending" },
    REJECTED: { bg: "bg-coral-alert/10", text: "text-coral-alert", dot: "bg-coral-alert", label: "Declined" },
    DECLINED: { bg: "bg-coral-alert/10", text: "text-coral-alert", dot: "bg-coral-alert", label: "Declined" },
    CANCELLED: { bg: "bg-steel/10", text: "text-ash", dot: "bg-steel", label: "Cancelled" },
    EXPIRED: { bg: "bg-steel/10", text: "text-ash", dot: "bg-steel", label: "Expired" },
  };
  const c = config[norm] || { bg: "bg-steel/10", text: "text-ash", dot: "bg-steel", label: status };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[11px] font-semibold tracking-wide whitespace-nowrap ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span>{c.label}</span>
    </span>
  );
}

const STATUS_MAP: Record<string, string> = {
  all: "",
  pending: "PENDING",
  accepted: "ACCEPTED",
  declined: "REJECTED",
  cancelled: "CANCELLED",
  expired: "EXPIRED",
};

function InvitationsPageInner() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isSearchExpanded = isSearchOpen || search.trim().length > 0;
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const backendStatus = STATUS_MAP[statusFilter] || undefined;

  const { data, isLoading, error } = useBusinessInvitations({
    page,
    limit: 10,
    status: backendStatus || undefined,
  });
  const cancelMutation = useCancelInvitation();
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

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

  // Client-side search filter on loaded results
  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (inv: any) =>
        inv.campaign?.title?.toLowerCase().includes(q) ||
        inv.promoterProfile?.username?.toLowerCase().includes(q) ||
        inv.campaign?.category?.toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  const confirmCancel = () => {
    if (!cancelConfirm) return;
    cancelMutation.mutate(cancelConfirm, {
      onSuccess: () => {
        notifySuccess("Invitation cancelled");
        setCancelConfirm(null);
      },
      onError: (e: any) => {
        notifyError(e?.response?.data?.message ?? "Failed to cancel invitation");
        setCancelConfirm(null);
      },
    });
  };

  const allItems = data?.items ?? [];
  const pendingCount = allItems.filter((i: any) => i.status === "PENDING").length;
  const acceptedCount = allItems.filter((i: any) => i.status === "ACCEPTED").length;
  const responseRate = allItems.length
    ? Math.round((allItems.filter((i: any) => i.status !== "PENDING").length / allItems.length) * 100)
    : 0;

  const TABS = [
    { key: "all", label: "All", count: data?.total },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "accepted", label: "Accepted", count: acceptedCount },
    { key: "declined", label: "Declined" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const fmtDate = (s?: string) => {
    if (!s) return "";
    try {
      return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
        <p className="text-base font-bold text-graphite">Failed to load invitations</p>
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
                Invitations
              </h1>
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-pill bg-sky-wash text-signal-blue border border-signal-blue/20">
                {data?.total ?? 0}
              </span>
            </div>
            <p className="text-sm text-ash mt-2">
              Track sent invitations, monitor promoter responses, and launch new collaborations.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => router.push("/business/promoters")}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-white border border-slate-custom/20 text-slate-custom hover:bg-sky-wash rounded-pill text-sm font-medium shadow-sm transition-all"
            >
              <Users size={16} weight="bold" />
              <span>Browse Promoters</span>
            </button>
            <button
              onClick={() => router.push("/business/campaigns/create")}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-signal-blue hover:bg-signal-blue/90 text-white rounded-pill text-sm font-semibold shadow-product-card transition-all hover:shadow-elevated"
            >
              <Plus size={16} weight="bold" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-signal-blue/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-sky-wash text-signal-blue flex items-center justify-center flex-shrink-0">
            <PaperPlaneTilt size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Invitations Sent</p>
            <p className="text-2xl font-bold font-mono text-midnight-ink mt-0.5">
              {data?.total ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-amber-tag/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-tag/15 text-amber-tag flex items-center justify-center flex-shrink-0">
            <HourglassSimple size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Pending Responses</p>
            <p className="text-2xl font-bold font-mono text-midnight-ink mt-0.5">
              {pendingCount}
            </p>
          </div>
        </div>

        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-emerald-status/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-status/10 text-emerald-status flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Accepted Collabs</p>
            <p className="text-2xl font-bold font-mono text-midnight-ink mt-0.5">
              {acceptedCount}
            </p>
          </div>
        </div>

        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-signal-blue/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-sky-wash text-signal-blue flex items-center justify-center flex-shrink-0">
            <TrendUp size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Response Rate</p>
            <p className="text-2xl font-bold font-mono text-midnight-ink mt-0.5">
              {responseRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Expandable Search Toolbar */}
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
            placeholder="Search by campaign or promoter..."
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

      {/* Invitations List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <SkeletonList count={4} rowHeight="h-28" />
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-steel/10 rounded-2xl p-12 shadow-product-card text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-wash text-signal-blue flex items-center justify-center mb-4">
              <PaperPlaneTilt size={28} weight="bold" />
            </div>
            <h3 className="text-base font-bold text-graphite">
              {search || statusFilter !== "all"
                ? "No invitations match your filters"
                : "No invitations sent yet"}
            </h3>
            <p className="text-xs text-ash mt-1 max-w-sm leading-relaxed">
              {search || statusFilter !== "all"
                ? "Try clearing your search query or switching to another filter."
                : "Explore our promoter directory to invite creators who match your target audience."}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {search || statusFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearch("");
                    setIsSearchOpen(false);
                    setStatusFilter("all");
                    setPage(1);
                  }}
                  className="px-4 py-2 rounded-pill bg-sky-wash text-signal-blue text-xs font-semibold hover:bg-signal-blue hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              ) : null}
              <button
                onClick={() => router.push("/business/promoters")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-blue text-white rounded-pill text-xs font-bold shadow-product-card hover:bg-signal-blue/90 transition-colors"
              >
                <Users size={15} weight="bold" /> Browse Promoters
              </button>
            </div>
          </div>
        ) : (
          filteredItems.map((inv: any) => (
            <div
              key={inv.id}
              className="group bg-white border border-steel/10 rounded-2xl p-5 shadow-product-card hover:-translate-y-0.5 hover:border-signal-blue/30 hover:shadow-elevated transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Left Column: Campaign & Promoter Info */}
              <div className="space-y-3 flex-1 min-w-0">
                {/* Campaign header line */}
                <div className="flex items-center gap-2 flex-wrap">
                  {inv.campaign?.category && (
                    <NicheBadge niche={inv.campaign.category} className="!py-0.5 !px-2 text-[10px]" />
                  )}
                  <h3
                    onClick={() => router.push(`/business/campaigns/${inv.campaign?.id}`)}
                    className="text-base font-bold text-graphite hover:text-signal-blue transition-colors cursor-pointer truncate"
                  >
                    {inv.campaign?.title || "Campaign"}
                  </h3>
                  <span className="text-xs font-bold font-mono text-ash bg-linen-canvas border border-steel/15 px-2 py-0.5 rounded-pill">
                    {formatBudget(inv.campaign?.budget)}
                  </span>
                </div>

                {/* Promoter Info Cardlet */}
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => inv.promoterProfile?.username && router.push(`/u/${inv.promoterProfile.username}`)}
                    className="cursor-pointer flex-shrink-0"
                  >
                    {inv.promoterProfile?.avatarUrl ? (
                      <img
                        src={inv.promoterProfile.avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-steel/15 shadow-sm"
                      />
                    ) : (
                      <Avatar
                        initials={inv.promoterProfile?.username?.[0]?.toUpperCase() ?? "P"}
                        size="md"
                        colorIndex={2}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={() => inv.promoterProfile?.username && router.push(`/u/${inv.promoterProfile.username}`)}
                        className="text-sm font-semibold text-graphite hover:text-signal-blue transition-colors cursor-pointer truncate"
                      >
                        @{inv.promoterProfile?.username || "Promoter"}
                      </span>
                      {inv.promoterProfile?.niche && (
                        <NicheBadge niche={inv.promoterProfile.niche} className="!py-0.2 !px-1.5 text-[9px]" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ash mt-0.5">
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin size={12} weight="bold" className="text-signal-blue/70 flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{inv.campaign?.location || "Remote"}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 flex-shrink-0">
                        <CalendarBlank size={12} weight="bold" className="text-signal-blue/70 flex-shrink-0" />
                        <span>Sent on {fmtDate(inv.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Custom message (if sent) */}
                {inv.message && (
                  <div className="bg-sky-wash/40 border border-steel/10 rounded-xl px-3 py-2 text-xs text-graphite flex items-start gap-2.5 max-w-2xl">
                    <ChatCircleDots size={15} weight="bold" className="text-signal-blue flex-shrink-0 mt-0.5" />
                    <p className="italic text-ash line-clamp-2 leading-relaxed">
                      "{inv.message}"
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Status Badge & Action Buttons */}
              <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-steel/10 flex-shrink-0">
                <InvitationStatusBadge status={inv.status} />

                <div className="flex items-center gap-2">
                  {inv.status === "ACCEPTED" ? (
                    <button
                      onClick={() => router.push("/business/collaborations")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-signal-blue hover:bg-signal-blue/90 text-white text-xs font-semibold shadow-product-card transition-all"
                    >
                      <Handshake size={14} weight="bold" />
                      <span>View Collab</span>
                    </button>
                  ) : inv.status === "PENDING" ? (
                    <button
                      onClick={() => setCancelConfirm(inv.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill border border-steel/15 bg-white text-ash hover:text-coral-alert hover:border-coral-alert/30 hover:bg-coral-alert/5 text-xs font-semibold transition-colors"
                    >
                      <XCircle size={14} weight="bold" />
                      <span>Cancel</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => inv.promoterProfile?.username && router.push(`/u/${inv.promoterProfile.username}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill bg-sky-wash text-signal-blue hover:bg-signal-blue hover:text-white text-xs font-semibold transition-colors"
                    title="View promoter profile"
                  >
                    <Eye size={14} weight="bold" />
                    <span>Profile</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {(data?.pages ?? 0) > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="h-8 min-w-[32px] px-2.5 rounded-pill text-xs font-bold text-ash hover:bg-sky-wash hover:text-graphite disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center"
          >
            <CaretLeft size={14} weight="bold" />
          </button>
          {Array.from({ length: data?.pages ?? 1 }, (_, i) => i + 1).map((p) => (
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
          <button
            onClick={() => setPage((p) => Math.min(data?.pages ?? 1, p + 1))}
            disabled={page >= (data?.pages ?? 1)}
            className="h-8 min-w-[32px] px-2.5 rounded-pill text-xs font-bold text-ash hover:bg-sky-wash hover:text-graphite disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center"
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-steel/10">
            <div className="w-11 h-11 rounded-xl bg-coral-alert/10 text-coral-alert flex items-center justify-center mb-3">
              <WarningCircle size={22} weight="bold" />
            </div>
            <h3 className="text-base font-bold text-graphite">Cancel Invitation</h3>
            <p className="text-xs text-ash mt-1.5 leading-relaxed">
              Are you sure you want to cancel this invitation? The promoter will be notified that the invitation was withdrawn.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setCancelConfirm(null)}
                className="px-4 py-2 rounded-pill text-xs font-semibold text-ash hover:text-graphite hover:bg-sky-wash transition-colors"
              >
                Keep Invitation
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 rounded-pill text-xs font-bold bg-coral-alert hover:bg-coral-alert/90 text-white shadow-sm transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusinessInvitationsPage() {
  return (
    <RequireAuth role={Role.BUSINESS}>
      <InvitationsPageInner />
    </RequireAuth>
  );
}
