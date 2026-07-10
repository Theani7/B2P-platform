"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { toast } from "react-hot-toast";
import { useMyApplications, useWithdrawApplication } from "@/features/applications/api";
import {
  FileText, Building2, MapPin, Clock, CheckCircle, CircleDashed, XCircle, MessageSquare,
  ChevronRight, ChevronLeft, Send, TrendingUp, AlertCircle, Share2, Eye,
} from "lucide-react";

const fmtNpr = (n?: number | null) => new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(n ?? 0);

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-amber-50 text-amber-700 ring-amber-600/20", icon: Clock, label: "Pending Review" },
  ACCEPTED: { color: "bg-emerald-status/10 text-emerald-status ring-emerald-status/20", icon: CheckCircle, label: "Accepted" },
  REJECTED: { color: "bg-coral-alert/10 text-coral-alert ring-red-600/20", icon: XCircle, label: "Declined" },
  WITHDRAWN: { color: "bg-linen-canvas text-ash ring-gray-600/20", icon: CircleDashed, label: "Withdrawn" },
};

function ApplicationsInner() {
  const [page, setPage] = useState(1);
  const [withdrawConfirm, setWithdrawConfirm] = useState<string | null>(null);

  const { data, isLoading, error } = useMyApplications({ page, limit: 10 });
  const withdraw = useWithdrawApplication();

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-coral-alert/10 flex items-center justify-center mb-4 ring-1 ring-coral-alert/10">
        <AlertCircle size={32} className="text-coral-alert" />
      </div>
      <p className="text-lg font-medium text-graphite">Error loading applications</p>
      <p className="text-sm text-ash mt-1">{(error as Error).message}</p>
    </div>
  );

  const confirmWithdraw = () => {
    if (!withdrawConfirm) return;
    withdraw.mutate(withdrawConfirm, {
      onSuccess: () => { toast.success("Application withdrawn"); setWithdrawConfirm(null); },
      onError: (e: any) => { toast.error(e?.response?.data?.message ?? "Failed to withdraw"); setWithdrawConfirm(null); },
    });
  };

  const applications = data?.items || [];
  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-graphite">My Applications</h1>
          <p className="text-sm text-ash mt-2 max-w-xl">Track every campaign you've applied for, monitor progress, and manage your creator pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/promoter/marketplace" className="inline-flex items-center gap-2 bg-signal-blue text-white h-11 px-5 rounded-xl text-sm font-semibold hover:opacity-90 transition-colors shadow-product-card-sm">
            <FileText size={16} /> Browse Marketplace
          </a>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Submitted</h3>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Send size={14} /></div>
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
          <p className="text-xs text-amber-tag font-medium mt-1">Awaiting response</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Accepted</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-status/10 text-emerald-status flex items-center justify-center"><CheckCircle size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{acceptedCount}</div>
          <p className="text-xs text-ash mt-1">Current page</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Rejected</h3>
            <div className="w-8 h-8 rounded-lg bg-coral-alert/10 text-coral-alert flex items-center justify-center"><XCircle size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{rejectedCount}</div>
          <p className="text-xs text-ash mt-1">Current page</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 md:col-span-1 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Accept Rate</h3>
            <div className="w-8 h-8 rounded-lg bg-sky-wash text-signal-blue flex items-center justify-center"><TrendingUp size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">
            {applications.length > 0 ? Math.round((acceptedCount / applications.length) * 100) : 0}%
          </div>
          <p className="text-xs text-fog font-medium mt-1">Current page</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-6">
          {isLoading ? (
            <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse ring-1 ring-gray-100" />)}</div>
          ) : !applications || applications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-linen-canvas rounded-full flex items-center justify-center text-gray-300 mb-4"><FileText size={32} /></div>
              <h2 className="text-xl font-bold text-graphite mb-2">No applications yet</h2>
              <p className="text-sm text-ash max-w-sm mb-6">You haven't applied to any campaigns. Browse the marketplace to find collaborations.</p>
              <a href="/promoter/marketplace" className="h-11 px-6 flex items-center justify-center rounded-xl bg-signal-blue text-white text-sm font-bold hover:opacity-90 transition-colors shadow-product-card-sm">Browse Marketplace</a>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app: any, index: number) => {
                const conf = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = conf.icon;
                const isAccepted = app.status === "ACCEPTED";
                const isRejected = app.status === "REJECTED";
                const isWithdrawn = app.status === "WITHDRAWN";
                return (
                  <div key={app.id} style={{ zIndex: 100 - index, position: "relative" }} className="bg-white rounded-2xl p-6 shadow-product-card-sm ring-1 ring-gray-200 hover:shadow-product-card-md hover:ring-signal-blue/20 transition-all group flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-white ring-1 ring-gray-200 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-indigo-600">
                          {app.campaign?.title?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-graphite truncate pr-4">{app.campaign?.title}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-ash mt-1">
                            <Building2 size={14} /> {app.campaign?.businessProfile?.companyName || "Business"}
                            <span className="mx-1">•</span>
                            <MapPin size={14} /> {app.campaign?.location || "Remote"}
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm font-bold text-graphite bg-linen-canvas px-2 py-0.5 rounded">{fmtNpr(app.campaign?.budget)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ring-1 ring-inset ${conf.color}`}>
                          <StatusIcon size={14} /> {conf.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {app.status === "PENDING" && (
                            <button onClick={() => setWithdrawConfirm(app.id)} className="h-9 px-4 bg-white border border-slate-custom/10 text-coral-alert hover:bg-coral-alert/10 hover:border-coral-alert/20 rounded-lg text-xs font-bold transition-colors">Withdraw</button>
                          )}
                          {app.status === "ACCEPTED" && (
                            <a href="/promoter/collaborations" className="h-9 px-4 bg-signal-blue text-white rounded-lg text-xs font-bold transition-colors hover:opacity-90 shadow-product-card-sm">View Collab</a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-custom/10 flex flex-col md:flex-row gap-6">
                      <div className="flex-1 w-full flex items-center max-w-sm">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-status text-white flex items-center justify-center ring-4 ring-emerald-50 z-10"><CheckCircle size={12} /></div>
                          <span className="text-[10px] font-bold text-graphite mt-2 uppercase tracking-wider">Submitted</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-emerald-status -mx-2 -mt-5 z-0" />
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-status text-white flex items-center justify-center ring-4 ring-emerald-50 z-10"><CheckCircle size={12} /></div>
                          <span className="text-[10px] font-bold text-graphite mt-2 uppercase tracking-wider">Viewed</span>
                        </div>
                        <div className={`flex-1 h-0.5 -mx-2 -mt-5 z-0 ${isAccepted || isRejected ? "bg-emerald-status" : "bg-gray-200"}`} />
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ring-4 z-10 ${isAccepted ? "bg-emerald-status text-white ring-emerald-50" : isRejected ? "bg-coral-alert text-white ring-red-50" : isWithdrawn ? "bg-gray-400 text-white ring-gray-50" : "bg-white border-2 border-slate-custom/20 text-transparent ring-white"}`}>
                            {isRejected ? <XCircle size={12} /> : isWithdrawn ? <CircleDashed size={12} /> : <CheckCircle size={12} />}
                          </div>
                          <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${isAccepted ? "text-emerald-status" : isRejected ? "text-coral-alert" : isWithdrawn ? "text-ash" : "text-fog"}`}>
                            {isAccepted ? "Accepted" : isRejected ? "Declined" : isWithdrawn ? "Withdrawn" : "Decision"}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="bg-linen-canvas rounded-xl p-4 h-full border border-slate-custom/10 flex items-start gap-3 relative overflow-hidden">
                          <MessageSquare size={16} className="text-fog flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-graphite mb-1">Your Cover Message</p>
                            <p className="text-sm text-ash line-clamp-2 italic pr-4">{app.message ? `"${app.message}"` : "No cover message provided."}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-10 px-4 rounded-xl border border-slate-custom/10 text-sm font-semibold hover:bg-linen-canvas disabled:opacity-50 flex items-center gap-1"><ChevronLeft size={16} /> Prev</button>
              <div className="flex items-center gap-1">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold ${p === page ? "bg-gray-900 text-white" : "text-ash hover:bg-sky-wash"}`}>{p}</button>
                ))}
              </div>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="h-10 px-4 rounded-xl border border-slate-custom/10 text-sm font-semibold hover:bg-linen-canvas disabled:opacity-50 flex items-center gap-1">Next <ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </div>

      {withdrawConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-graphite/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-graphite mb-3">Withdraw Application</h3>
            <p className="text-sm text-ash mb-8">Are you sure you want to withdraw this application? The business will be notified that you are no longer interested.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setWithdrawConfirm(null)} className="px-5 py-2.5 text-sm font-bold text-graphite bg-white border border-slate-custom/10 rounded-inputs hover:bg-sky-wash">Cancel</button>
              <button onClick={confirmWithdraw} className="px-6 py-2.5 text-sm font-bold text-coral-alert bg-coral-alert/10 rounded-inputs hover:bg-coral-alert/20">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PromoterApplicationsPage() {
  return (
    <RequireAuth role={Role.PROMOTER}>
      <ApplicationsInner />
    </RequireAuth>
  );
}
