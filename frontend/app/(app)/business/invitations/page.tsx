"use client";

import { useState, useMemo } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { StatCard } from "@/components/ui/Stats";
import { useBusinessInvitations, useCancelInvitation } from "@/features/invitations/api";
import { useRouter } from "next/navigation";
import {
  Send, XCircle, MapPin, MessageSquare, UserPlus, Search, Clock, Users, Eye,
  MoreHorizontal, CheckCircle2, ChevronRight, ChevronLeft,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    ACCEPTED: { color: "text-emerald-status bg-emerald-status/10 ring-emerald-status/20", icon: CheckCircle2, label: "Accepted" },
    PENDING: { color: "text-amber-700 bg-amber-50 ring-amber-600/20", icon: Clock, label: "Pending" },
    REJECTED: { color: "text-coral-alert bg-coral-alert/10 ring-red-600/20", icon: XCircle, label: "Declined" },
    CANCELLED: { color: "text-graphite bg-linen-canvas ring-gray-600/20", icon: XCircle, label: "Cancelled" },
    EXPIRED: { color: "text-graphite bg-linen-canvas ring-gray-600/20", icon: Send, label: "Expired" },
  };
  const c = config[status] || { color: "text-graphite bg-linen-canvas ring-gray-600/20", icon: Send, label: status };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ring-1 ring-inset ${c.color} whitespace-nowrap`}>
      <Icon size={14} /> {c.label}
    </span>
  );
}

// Map UI filter value → backend status value
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

  const backendStatus = STATUS_MAP[statusFilter] || undefined;

  const { data, isLoading, error } = useBusinessInvitations({
    page,
    limit: 10,
    status: backendStatus || undefined,
  });
  const cancelMutation = useCancelInvitation();
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  // Client-side search filter on loaded results
  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (inv: any) =>
        inv.campaign?.title?.toLowerCase().includes(q) ||
        inv.promoterProfile?.username?.toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-coral-alert/10 flex items-center justify-center mb-4 ring-1 ring-coral-alert/10">
        <XCircle size={32} className="text-coral-alert" />
      </div>
      <p className="text-lg font-medium text-graphite">Error loading invitations</p>
      <p className="text-sm text-ash mt-1">{(error as Error).message}</p>
    </div>
  );

  const confirmCancel = () => {
    if (!cancelConfirm) return;
    cancelMutation.mutate(cancelConfirm, {
      onSuccess: () => { notifySuccess("Invitation cancelled"); setCancelConfirm(null); },
      onError: (e: any) => { notifyError(e?.response?.data?.message ?? "Failed"); setCancelConfirm(null); },
    });
  };

  const formatBudget = (n?: number) => (typeof n === "number" ? "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0) : "—");

  const allItems = data?.items ?? [];
  const pendingCount = allItems.filter((i: any) => i.status === "PENDING").length;
  const acceptedCount = allItems.filter((i: any) => i.status === "ACCEPTED").length;
  const responseRate = allItems.length
    ? Math.round((allItems.filter((i: any) => i.status !== "PENDING").length / allItems.length) * 100)
    : 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-graphite">Sent Invitations</h1>
          <p className="text-sm text-ash mt-1.5">Track every invitation you've sent and monitor promoter responses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/business/promoters")}
            className="inline-flex items-center gap-2 bg-white border border-slate-custom/10 text-graphite h-10 px-4 rounded-lg text-sm font-medium hover:bg-linen-canvas transition-all shadow-product-card-sm"
          >
            <UserPlus size={16} /> Browse Promoters
          </button>
          <button
            onClick={() => router.push("/business/campaigns/create")}
            className="inline-flex items-center gap-2 bg-signal-blue text-white h-10 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-product-card-sm"
          >
            <Send size={16} /> Create Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Invitations Sent" value={data?.total ?? 0} />
        <StatCard label="Pending Responses" value={pendingCount} />
        <StatCard label="Accepted Invitations" value={acceptedCount} />
        <StatCard label="Response Rate" value={`${responseRate}%`} />
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-product-card-sm ring-1 ring-gray-200 p-2 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fog" />
            <input
              type="text"
              placeholder="Search by campaign or promoter…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 h-10 bg-linen-canvas border border-slate-custom/10 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-signal-blue text-sm text-graphite placeholder-gray-400 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {["All", "Pending", "Accepted", "Declined", "Cancelled", "Expired"].map((label) => {
            const key = label.toLowerCase();
            const isActive = statusFilter === key;
            return (
              <button
                key={label}
                onClick={() => { setStatusFilter(key); setPage(1); }}
                className={`whitespace-nowrap px-4 h-8 rounded-full text-xs font-semibold tracking-wide transition-colors border flex-shrink-0 ${isActive ? "bg-sky-wash border-signal-blue text-signal-blue" : "bg-white border-slate-custom/10 text-ash hover:bg-linen-canvas"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 ring-1 ring-gray-100 shadow-product-card-sm animate-pulse flex items-center gap-8">
                <div className="w-16 h-16 bg-sky-wash rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-sky-wash rounded w-1/4" />
                  <div className="h-4 bg-sky-wash rounded w-1/3" />
                </div>
                <div className="w-32 h-10 bg-sky-wash rounded-lg flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-product-card-sm ring-1 ring-gray-200">
            <div className="w-20 h-20 rounded-full bg-linen-canvas flex items-center justify-center mb-5 ring-1 ring-gray-900/5">
              <Send size={32} className="text-gray-300 ml-1" />
            </div>
            <h3 className="text-lg font-semibold text-graphite">
              {search || statusFilter !== "all" ? "No invitations match your filters" : "No invitations sent yet"}
            </h3>
            <p className="text-sm text-ash mt-2 max-w-md">
              {search || statusFilter !== "all"
                ? "Try clearing the search or changing the status filter."
                : "Start inviting promoters from the directory to collaborate on your active marketing campaigns."}
            </p>
            {!search && statusFilter === "all" && (
              <button
                onClick={() => router.push("/business/promoters")}
                className="mt-6 inline-flex items-center gap-2 bg-signal-blue text-white rounded-lg h-10 px-6 text-sm font-medium hover:opacity-90 transition-colors shadow-product-card-sm"
              >
                <Users size={16} /> Browse Promoters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full overflow-x-auto pb-6 -mb-6">
              <div className="min-w-[1100px] flex flex-col gap-4">
                <div className="grid grid-cols-[minmax(260px,2.5fr)_minmax(220px,2fr)_minmax(180px,1.5fr)_minmax(320px,2.5fr)_140px] gap-8 px-6 py-2 text-xs font-semibold text-ash uppercase tracking-wider">
                  <div>Campaign</div>
                  <div>Promoter</div>
                  <div>Status</div>
                  <div>Message</div>
                  <div className="text-right">Actions</div>
                </div>

                {filteredItems.map((inv: any, index: number) => (
                  <div
                    key={inv.id}
                    style={{ zIndex: 100 - index, position: "relative" }}
                    className="grid grid-cols-[minmax(260px,2.5fr)_minmax(220px,2fr)_minmax(180px,1.5fr)_minmax(320px,2.5fr)_140px] gap-8 items-center p-6 bg-white rounded-xl shadow-product-card-sm ring-1 ring-gray-200 hover:ring-signal-blue/30 hover:shadow-product-card-md transition-all group"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-product-card-sm flex-shrink-0 bg-signal-blue">
                        {inv.campaign?.title?.charAt(0).toUpperCase() || "C"}
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <p className="text-[20px] leading-tight font-bold text-graphite truncate">{inv.campaign?.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {inv.campaign?.category && (
                            <span className="text-[10px] font-bold text-ash bg-sky-wash px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">{inv.campaign.category}</span>
                          )}
                          <span className="text-sm font-medium text-ash whitespace-nowrap">{formatBudget(inv.campaign?.budget)}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-3 cursor-pointer group/promoter hover:bg-linen-canvas p-2 -ml-2 rounded-lg transition-colors min-w-0"
                      onClick={() => inv.promoterProfile?.username && router.push(`/promoters/${inv.promoterProfile.username}`)}
                    >
                      {inv.promoterProfile?.avatarUrl ? (
                        <img src={inv.promoterProfile.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50 flex-shrink-0" />
                      ) : (
                        <Avatar initials={inv.promoterProfile?.username?.[0]?.toUpperCase() ?? "P"} size="md" colorIndex={1} />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-graphite truncate group-hover/promoter:text-signal-blue transition-colors">
                          {inv.promoterProfile?.username || "Promoter"}
                        </p>
                        <p className="text-sm text-ash mt-0.5 flex items-center gap-1 truncate">
                          <MapPin size={12} className="flex-shrink-0" /> <span className="truncate">{inv.campaign?.location || "Remote"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-0">
                      <StatusBadge status={inv.status} />
                      <span className="text-xs text-fog font-medium whitespace-nowrap">
                        {new Date(inv.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <div className="w-full min-w-0">
                      {inv.message ? (
                        <div className="bg-linen-canvas/80 border border-slate-custom/10 rounded-2xl p-3">
                          <p className="text-sm text-ash line-clamp-2 leading-relaxed">{inv.message}</p>
                        </div>
                      ) : (
                        <div className="bg-linen-canvas/50 border border-slate-custom/10 border-dashed rounded-2xl p-4 flex items-center justify-center gap-2 whitespace-nowrap">
                          <MessageSquare size={16} className="text-gray-300 flex-shrink-0" />
                          <span className="text-sm text-fog italic font-medium truncate">No custom message</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 w-[140px] flex-shrink-0">
                      <div className="flex-1">
                        {inv.status === "ACCEPTED" ? (
                          <button onClick={() => router.push("/business/collaborations")} className="w-full bg-signal-blue text-white h-10 px-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-colors shadow-product-card-sm whitespace-nowrap">
                            View Collab
                          </button>
                        ) : inv.status === "PENDING" ? (
                          <button onClick={() => setCancelConfirm(inv.id)} className="w-full bg-white border border-slate-custom/10 text-graphite h-10 px-3 rounded-lg text-sm font-semibold hover:bg-linen-canvas hover:text-coral-alert hover:border-coral-alert/20 transition-colors shadow-product-card-sm whitespace-nowrap">
                            Cancel
                          </button>
                        ) : (
                          <button onClick={() => inv.promoterProfile?.username && router.push(`/promoters/${inv.promoterProfile.username}`)} className="w-full bg-white border border-slate-custom/10 text-graphite h-10 px-3 rounded-lg text-sm font-semibold hover:bg-linen-canvas transition-colors shadow-product-card-sm whitespace-nowrap">
                            Profile
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => inv.promoterProfile?.username && router.push(`/promoters/${inv.promoterProfile.username}`)}
                        className="w-10 h-10 rounded-lg border border-slate-custom/10 text-ash hover:bg-linen-canvas hover:text-graphite transition-colors bg-white shadow-product-card-sm flex items-center justify-center"
                        title="View promoter profile"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(data?.pages ?? 0) > 1 && (
              <div className="bg-white px-6 py-4 rounded-xl shadow-product-card-sm ring-1 ring-gray-200 flex items-center justify-between mt-6">
                <p className="text-sm text-ash">
                  Page <span className="font-semibold text-graphite">{page}</span> of <span className="font-semibold text-graphite">{data?.pages}</span>
                  {" "}· <span className="font-semibold text-graphite">{data?.total ?? 0}</span> total invitations
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg border border-slate-custom/10 text-ash hover:bg-linen-canvas disabled:opacity-50 transition-colors shadow-product-card-sm">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(data?.pages ?? 1, p + 1))} disabled={page >= (data?.pages ?? 1)} className="p-2 rounded-lg border border-slate-custom/10 text-ash hover:bg-linen-canvas disabled:opacity-50 transition-colors shadow-product-card-sm">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {cancelConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-cards p-6 max-w-md w-full shadow-xl">
            <h3 className="text-heading font-bold text-graphite">Cancel Invitation</h3>
            <p className="text-sm text-ash mt-2">Are you sure you want to cancel this invitation? The promoter will be notified that the offer was withdrawn.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setCancelConfirm(null)}>Keep it</Button>
              <Button variant="danger" onClick={confirmCancel} disabled={cancelMutation.isPending}>
                {cancelMutation.isPending ? "Cancelling…" : "Yes, Cancel"}
              </Button>
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
