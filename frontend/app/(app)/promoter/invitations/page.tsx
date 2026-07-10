"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";
import { usePromoterInvitations, useAcceptInvitation, useRejectInvitation } from "@/features/invitations/api";
import {
  Mail, Building2, Clock, MapPin, Briefcase, Star, CheckCircle2, XCircle, AlertCircle, MessageCircle,
  ChevronRight, ChevronLeft, Search, Inbox,
} from "lucide-react";

const fmtNpr = (n?: number | null) => new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(n ?? 0);

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-amber-50 text-amber-700 ring-amber-600/20", icon: Clock, label: "Action Required" },
  ACCEPTED: { color: "bg-emerald-status/10 text-emerald-status ring-emerald-status/20", icon: CheckCircle2, label: "Accepted" },
  REJECTED: { color: "bg-coral-alert/10 text-coral-alert ring-red-600/20", icon: XCircle, label: "Declined" },
  EXPIRED: { color: "bg-linen-canvas text-ash ring-gray-600/20", icon: AlertCircle, label: "Expired" },
};

function InvitationsInner() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, error } = usePromoterInvitations({ page, limit: 10, status: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined });
  const accept = useAcceptInvitation();
  const reject = useRejectInvitation();
  const [actionConfirm, setActionConfirm] = useState<{ id: string; action: "accept" | "reject" } | null>(null);
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<any | null>(null);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-coral-alert/10 flex items-center justify-center mb-4 ring-1 ring-coral-alert/10">
        <AlertCircle size={32} className="text-coral-alert" />
      </div>
      <p className="text-lg font-medium text-graphite">Error loading inbox</p>
      <p className="text-sm text-ash mt-1">{(error as Error).message}</p>
    </div>
  );

  const confirmAction = () => {
    if (!actionConfirm) return;
    if (actionConfirm.action === "accept") {
      accept.mutate(actionConfirm.id, { onSuccess: () => { notifySuccess("Invitation accepted! Collaboration created."); setActionConfirm(null); }, onError: (e: any) => { notifyError(e?.response?.data?.message ?? "Failed"); setActionConfirm(null); } });
    } else {
      reject.mutate(actionConfirm.id, { onSuccess: () => { notifySuccess("Invitation declined."); setActionConfirm(null); }, onError: (e: any) => { notifyError(e?.response?.data?.message ?? "Failed"); setActionConfirm(null); } });
    }
  };

  const invites = data?.items || [];
  const pendingCount = invites.filter((i) => i.status === "PENDING").length;
  const acceptedCount = invites.filter((i) => i.status === "ACCEPTED").length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      {/* PREMIUM HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-graphite">My Invitations</h1>
          <p className="text-sm text-ash mt-2 max-w-xl">Review and manage exclusive collaboration requests sent directly from verified businesses.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/promoter/marketplace" className="inline-flex items-center gap-2 bg-signal-blue text-white h-11 px-5 rounded-xl text-sm font-semibold hover:opacity-90 transition-colors shadow-product-card-sm">
            <Search size={16} /> Marketplace
          </a>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Total Received</h3>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Mail size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{data?.total ?? 0}</div>
          <p className="text-xs text-ash mt-1">All time</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Pending</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-tag flex items-center justify-center"><Clock size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{pendingCount}</div>
          <p className="text-xs text-amber-tag font-medium mt-1">Needs attention</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Accepted</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-status/10 text-emerald-status flex items-center justify-center"><CheckCircle2 size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{acceptedCount}</div>
          <p className="text-xs font-semibold text-emerald-status mt-1">Converted to collab</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Accept Rate</h3>
            <div className="w-8 h-8 rounded-lg bg-sky-wash text-signal-blue flex items-center justify-center"><Star size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">
            {invites.length > 0 ? Math.round((acceptedCount / invites.length) * 100) : 0}%
          </div>
          <p className="text-xs text-fog font-medium mt-1">Based on current page</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-6">
          {/* STICKY FILTER TOOLBAR */}
          <div className="sticky top-0 z-30 bg-linen-canvas/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="bg-white p-2 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 flex flex-col gap-3">
              <div className="flex gap-2 overflow-x-auto px-2 pb-1">
                {["All", "Pending", "Accepted", "Declined"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status.toLowerCase())}
                    className={`whitespace-nowrap px-4 h-8 rounded-full text-xs font-semibold tracking-wide transition-colors border ${statusFilter === status.toLowerCase() ? "bg-gray-900 text-white border-gray-900" : "bg-white text-ash border-slate-custom/10 hover:bg-linen-canvas"}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INVITATION LIST */}
          {isLoading ? (
            <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse ring-1 ring-gray-100" />)}</div>
          ) : !invites || invites.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-linen-canvas rounded-full flex items-center justify-center text-gray-300 mb-4"><Inbox size={32} /></div>
              <h2 className="text-xl font-bold text-graphite mb-2">Inbox is empty</h2>
              <p className="text-sm text-ash max-w-sm mb-6">You don't have any pending invitations right now. Complete your profile to attract more brands.</p>
              <a href="/promoter/profile" className="h-11 px-6 flex items-center justify-center rounded-xl bg-signal-blue text-white text-sm font-bold hover:opacity-90 transition-colors shadow-product-card-sm">Complete Profile</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invites.map((inv: any) => {
                const conf = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = conf.icon;
                const isPending = inv.status === "PENDING";
                const isAccepted = inv.status === "ACCEPTED";
                return (
                  <div key={inv.id} className="bg-white rounded-2xl p-6 shadow-product-card-sm ring-1 ring-gray-200 hover:shadow-product-card hover:ring-signal-blue/30 transition-all flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-white ring-1 ring-gray-200 flex items-center justify-center flex-shrink-0 text-xl font-bold text-indigo-600">
                          {inv.campaign?.businessProfile?.companyName?.charAt(0).toUpperCase() || "B"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-graphite truncate">{inv.campaign?.businessProfile?.companyName}</h3>
                          <p className="text-xs text-ash flex items-center gap-1.5 truncate mt-0.5"><Building2 size={12} /> Verified Business</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset whitespace-nowrap ${conf.color}`}>
                        <StatusIcon size={14} /> {conf.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-sm font-bold text-graphite flex items-center gap-1">
                        {fmtNpr(inv.campaign?.budget)} <span className="text-xs text-fog font-medium">budget</span>
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-graphite mb-1">{inv.campaign?.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-ash">
                        <span className="flex items-center gap-1"><Briefcase size={12} /> {inv.campaign?.location ? "Campaign" : "Campaign"}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {inv.campaign?.location || "Remote"}</span>
                      </div>
                    </div>

                    <div className="bg-linen-canvas rounded-xl p-4 border border-slate-custom/10 mb-6 relative">
                      <div className="flex items-start gap-2">
                        <MessageCircle size={14} className="text-fog mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-ash line-clamp-3 italic">{inv.message || "We'd love to collaborate with you on our upcoming campaign."}</p>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-slate-custom/10 pt-5">
                      {isPending ? (
                        <div className="flex gap-2">
                          <button onClick={() => setActionConfirm({ id: inv.id, action: "accept" })} disabled={accept.isPending} className="flex-1 h-10 rounded-xl bg-signal-blue text-white text-sm font-bold hover:opacity-90 transition-colors shadow-product-card-sm">Accept Offer</button>
                          <button onClick={() => setActionConfirm({ id: inv.id, action: "reject" })} disabled={reject.isPending} className="flex-1 h-10 rounded-xl bg-white border border-slate-custom/10 text-graphite text-sm font-bold hover:bg-linen-canvas transition-colors shadow-product-card-sm">Decline</button>
                        </div>
                      ) : isAccepted ? (
                        <a href="/promoter/collaborations" className="w-full h-10 rounded-xl bg-signal-blue text-white text-sm font-bold hover:opacity-90 transition-colors shadow-product-card-sm flex items-center justify-center gap-2">
                          Open Collaboration <ChevronRight size={16} />
                        </a>
                      ) : (
                        <button onClick={() => setSelectedCampaignDetails({ ...inv.campaign, businessName: inv.campaign?.businessProfile?.companyName })} className="w-full h-10 rounded-xl bg-sky-wash text-ash text-sm font-bold hover:bg-gray-200 transition-colors">View Campaign Details</button>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[10px] text-fog font-semibold">Received: {new Date(inv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-10 px-4 rounded-xl border border-slate-custom/10 text-sm font-semibold hover:bg-linen-canvas disabled:opacity-50">Prev</button>
              <div className="flex items-center gap-1">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold ${p === page ? "bg-gray-900 text-white" : "text-ash hover:bg-sky-wash"}`}>{p}</button>
                ))}
              </div>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="h-10 px-4 rounded-xl border border-slate-custom/10 text-sm font-semibold hover:bg-linen-canvas disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>

      {actionConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-graphite/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-graphite mb-3">{actionConfirm.action === "accept" ? "Accept Offer" : "Decline Offer"}</h3>
            <p className="text-sm text-ash mb-8">{actionConfirm.action === "accept" ? "Are you sure you want to accept this invitation? This will instantly start a new collaboration project." : "Are you sure you want to decline? The business will be notified."}</p>
            <div className="flex justify-end gap-3">
               <button onClick={() => setActionConfirm(null)} className="px-5 py-2.5 text-sm font-bold text-graphite bg-white border border-slate-custom/10 rounded-inputs hover:bg-sky-wash">Cancel</button>
               <button onClick={confirmAction} disabled={accept.isPending || reject.isPending} className={`px-6 py-2.5 text-sm font-bold text-white rounded-inputs transition-colors disabled:opacity-50 ${actionConfirm.action === "accept" ? "bg-signal-blue hover:bg-signal-blue/90" : "bg-coral-alert hover:bg-coral-alert/90"}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {selectedCampaignDetails && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-graphite/60 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-white rounded-cards-lg shadow-product-card overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-custom/10 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-heading text-graphite line-clamp-1">{selectedCampaignDetails.title}</h2>
              <button onClick={() => setSelectedCampaignDetails(null)} className="text-ash hover:text-graphite"><XCircle size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-button bg-gradient-to-br from-sky-wash to-white ring-1 ring-slate-custom/10 flex items-center justify-center flex-shrink-0 text-xl font-bold text-signal-blue">
                  {selectedCampaignDetails.businessName?.charAt(0).toUpperCase() || "B"}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-graphite">{selectedCampaignDetails.businessName}</span>
                    <CheckCircle2 size={14} className="text-signal-blue" />
                  </div>
                  <span className="inline-flex mt-0.5 text-[10px] font-bold text-fog uppercase tracking-wider">{selectedCampaignDetails.category}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-ash uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-graphite leading-relaxed whitespace-pre-wrap">{selectedCampaignDetails.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-linen-canvas p-3 rounded-inputs border border-slate-custom/10">
                    <span className="text-[10px] font-bold text-fog uppercase tracking-wider block mb-1">Budget</span>
                    <span className="text-sm font-bold text-emerald-status">{fmtNpr(selectedCampaignDetails.budget)}</span>
                  </div>
                  <div className="bg-linen-canvas p-3 rounded-inputs border border-slate-custom/10">
                    <span className="text-[10px] font-bold text-fog uppercase tracking-wider block mb-1">Location</span>
                    <span className="text-sm font-medium text-graphite">{selectedCampaignDetails.location || "Anywhere"}</span>
                  </div>
                  <div className="bg-linen-canvas p-3 rounded-inputs border border-slate-custom/10">
                    <span className="text-[10px] font-bold text-fog uppercase tracking-wider block mb-1">Start Date</span>
                    <span className="text-sm font-medium text-graphite">{new Date(selectedCampaignDetails.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-linen-canvas p-3 rounded-inputs border border-slate-custom/10">
                    <span className="text-[10px] font-bold text-fog uppercase tracking-wider block mb-1">End Date</span>
                    <span className="text-sm font-medium text-graphite">{new Date(selectedCampaignDetails.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {selectedCampaignDetails.targetAudience && (
                  <div>
                    <h3 className="text-xs font-bold text-ash uppercase tracking-wider mb-2">Target Audience</h3>
                    <p className="text-sm text-graphite leading-relaxed">{selectedCampaignDetails.targetAudience}</p>
                  </div>
                )}

                {selectedCampaignDetails.requirements && (
                  <div>
                    <h3 className="text-xs font-bold text-ash uppercase tracking-wider mb-2">Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCampaignDetails.requirements.split(",").map((req: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-inputs bg-sky-wash text-signal-blue text-xs font-semibold border border-signal-blue/20">
                          {req.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-linen-canvas border-t border-slate-custom/10 flex justify-end gap-3 sticky bottom-0">
              <button onClick={() => setSelectedCampaignDetails(null)} className="h-10 px-6 rounded-inputs border border-slate-custom/10 text-sm font-semibold text-graphite hover:bg-sky-wash">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PromoterInvitationsPage() {
  return (
    <RequireAuth role={Role.PROMOTER}>
      <InvitationsInner />
    </RequireAuth>
  );
}
