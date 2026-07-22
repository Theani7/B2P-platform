"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import {
  useBusinessCollaborations,
  useBusinessDeliverables,
  useReviewDeliverable,
  type Collaboration,
  type DeliverableStatus,
} from "@/features/collaborations/api";
import { useCompleteCollaboration } from "@/features/reviews/api";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";
import { Portal } from "@/components/ui/Portal";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, XCircle, Clock, Star, TrendingUp, Wallet, MessageCircle,
  Building2, Briefcase, UserCheck, MoreVertical, Search as SearchIcon,
  Link2, FileText, MessageSquare, ExternalLink, CalendarDays, Check, RotateCcw
} from "lucide-react";
import { formatNepaliCurrency } from "@/utils/currency";

const deliverableTone: Record<DeliverableStatus, "slate" | "signal" | "emerald" | "coral" | "amber"> = {
  DRAFT: "slate",
  IN_REVIEW: "signal",
  APPROVED: "emerald",
  REVISION_REQUESTED: "coral",
  PUBLISHED: "emerald",
};

function DeliverablesPanel({ collaborationId }: { collaborationId: string }) {
  const { data, isLoading } = useBusinessDeliverables(collaborationId);
  const review = useReviewDeliverable();
  const [revisionModalFor, setRevisionModalFor] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const act = (deliverableId: string, status: DeliverableStatus, feedback?: string) =>
    review.mutate(
      { collaborationId, deliverableId, status, feedback },
      { onSuccess: () => notifySuccess("Deliverable updated"), onError: (e: any) => notifyError(e?.response?.data?.message ?? "Update failed") },
    );

  const submitRevision = () => {
    if (revisionModalFor) {
      act(revisionModalFor, "REVISION_REQUESTED", feedbackText.trim() || undefined);
      setRevisionModalFor(null);
      setFeedbackText("");
    }
  };

  return (
    <div className="mt-6 border-t border-slate-custom/10 pt-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[11px] font-bold text-fog uppercase tracking-widest flex items-center gap-2">
          <FileText size={14} className="text-steel" />
          Project Deliverables
        </h4>
        {data && data.length > 0 && (
          <span className="text-xs font-bold text-graphite bg-linen-canvas px-2 py-0.5 rounded-md border border-slate-custom/10">
            {data.length} items
          </span>
        )}
      </div>

      {isLoading && (
        <div className="py-4 flex justify-center">
          <Spinner />
        </div>
      )}
      
      {data && data.length === 0 && (
        <div className="bg-linen-canvas rounded-xl p-6 text-center border border-dashed border-steel/20">
          <div className="w-10 h-10 mx-auto bg-white rounded-full flex items-center justify-center text-steel mb-3 shadow-sm ring-1 ring-gray-100">
            <FileText size={18} />
          </div>
          <p className="text-sm font-medium text-graphite mb-1">No deliverables yet</p>
          <p className="text-xs text-ash">The promoter hasn't submitted any work for review.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid gap-3">
          {data.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-custom/10 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-bold text-graphite truncate pr-2">{d.title}</h5>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-ash">
                      <CalendarDays size={12} />
                      {new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      d.status === 'APPROVED' || d.status === 'PUBLISHED' ? 'bg-emerald-status/10 text-emerald-status' :
                      d.status === 'REVISION_REQUESTED' ? 'bg-coral-alert/10 text-coral-alert' :
                      d.status === 'IN_REVIEW' ? 'bg-amber-50 text-amber-tag' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <a 
                  href={d.contentUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 bg-linen-canvas hover:bg-sky-wash transition-colors p-2.5 rounded-lg border border-slate-custom/10 mb-3 group"
                >
                  <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-signal-blue shrink-0 shadow-sm">
                    <Link2 size={12} />
                  </div>
                  <span className="text-xs font-medium text-graphite truncate flex-1 group-hover:text-signal-blue transition-colors">
                    {d.contentUrl}
                  </span>
                  <ExternalLink size={14} className="text-steel group-hover:text-signal-blue shrink-0 mr-1" />
                </a>

                {d.description && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-fog uppercase tracking-widest mb-1.5">Description</p>
                    <p className="text-xs text-ash leading-relaxed bg-linen-canvas/50 p-2.5 rounded-lg border border-slate-custom/5">{d.description}</p>
                  </div>
                )}
                
                {d.feedback && (
                  <div className="mt-2 bg-coral-alert/5 p-2.5 rounded-lg border border-coral-alert/20 flex gap-2">
                    <MessageSquare size={14} className="text-coral-alert shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-coral-alert uppercase tracking-widest mb-0.5">Your Feedback</p>
                      <p className="text-xs text-coral-alert/90 font-medium">{d.feedback}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {(d.status === "IN_REVIEW" || d.status === "DRAFT" || d.status === "REVISION_REQUESTED" || d.status === "APPROVED") && (
                <div className="bg-linen-canvas border-t border-slate-custom/10 p-2.5 flex gap-2">
                  {(d.status === "APPROVED" || d.status === "REVISION_REQUESTED") && (
                    <button 
                      onClick={() => act(d.id, "PUBLISHED")}
                      className="flex-1 h-8 rounded-lg bg-white border border-slate-custom/10 text-graphite text-xs font-bold hover:bg-linen-canvas transition-colors flex items-center justify-center gap-1.5"
                    >
                      Mark Published
                    </button>
                  )}
                  
                  {(d.status === "IN_REVIEW" || d.status === "DRAFT" || d.status === "REVISION_REQUESTED") && (
                    <button 
                      onClick={() => act(d.id, "APPROVED")}
                      className="flex-1 h-8 rounded-lg bg-gray-900 text-white text-xs font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}

                  {(d.status === "IN_REVIEW" || d.status === "DRAFT") && (
                    <button 
                      onClick={() => { setRevisionModalFor(d.id); setFeedbackText(""); }}
                      className="flex-1 h-8 rounded-lg bg-coral-alert/10 text-coral-alert hover:bg-coral-alert/20 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw size={14} /> Request Revision
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {revisionModalFor && (
        <Portal>
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4">
            <div className="bg-white border border-slate-custom/10 rounded-cards-lg p-6 shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-bold text-graphite mb-2">Request Revision</h3>
              <p className="text-xs text-ash mb-4">Provide constructive feedback so the promoter knows exactly what to change.</p>
              
              <textarea
                className="w-full min-h-[100px] rounded-inputs border border-slate-custom/10 bg-white px-3 py-2 text-sm text-graphite placeholder-fog outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue/20 transition-all shadow-sm resize-y mb-6"
                placeholder="What needs to be improved? (Optional)"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => { setRevisionModalFor(null); setFeedbackText(""); }}
                  className="px-4 py-2 text-xs font-bold text-graphite bg-white border border-slate-custom/10 rounded-inputs hover:bg-sky-wash"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitRevision}
                  className="px-5 py-2 text-xs font-bold text-white rounded-inputs bg-coral-alert hover:opacity-90 shadow-sm"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

function CollabCard({ collab }: { collab: Collaboration }) {
  const [open, setOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const complete = useCompleteCollaboration();
  const router = useRouter();
  const isCompleted = collab.status === "COMPLETED";
  const isActive = collab.status === "ACTIVE";

  const progress = (() => {
    if (!collab.campaignStartDate || !collab.campaignEndDate) return isCompleted ? 100 : 50;
    const start = new Date(collab.campaignStartDate).getTime();
    const end = new Date(collab.campaignEndDate).getTime();
    const now = Date.now();
    if (isCompleted) return 100;
    return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
  })();

  const daysLeft = collab.campaignEndDate && !isCompleted
    ? Math.max(0, Math.ceil((new Date(collab.campaignEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const formatBudget = (n: number) => "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

  return (
    <div className="bg-white rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 hover:shadow-product-card hover:ring-signal-blue/20 transition-all group flex flex-col overflow-hidden">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-linen-canvas border border-slate-custom/10 flex items-center justify-center flex-shrink-0 text-lg font-bold text-graphite">
              {collab.partnerAvatarUrl ? (
                <img src={collab.partnerAvatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                collab.partnerName?.slice(0, 2).toUpperCase() || "??"
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-graphite truncate pr-2">{collab.campaignTitle}</h3>
              <p className="text-sm text-ash flex items-center gap-1.5 truncate mt-0.5">
                <UserCheck size={14} /> {collab.partnerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isActive ? "bg-sky-wash text-blue-700 border border-blue-100" : isCompleted ? "bg-emerald-status/10 text-emerald-status border border-emerald-100" : "bg-linen-canvas text-ash border border-slate-custom/10"}`}>
              {collab.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-linen-canvas rounded-xl p-3 border border-slate-custom/10">
            <p className="text-[11px] font-bold text-fog uppercase tracking-widest mb-1">Budget</p>
            <p className="text-sm font-bold text-graphite">{formatNepaliCurrency(collab.campaignBudget)}</p>
          </div>
          <div className="bg-linen-canvas rounded-xl p-3 border border-slate-custom/10">
            <p className="text-[11px] font-bold text-fog uppercase tracking-widest mb-1">Timeline</p>
            <p className="text-sm font-bold text-graphite">{isCompleted ? "Completed" : daysLeft !== null ? `${daysLeft} days left` : "Ongoing"}</p>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-graphite">Project Progress</span>
            <span className={isCompleted ? "text-emerald-status" : "text-signal-blue"}>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-sky-wash rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-status" : "bg-signal-blue"}`} style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-fog uppercase tracking-widest mt-2">
            <span className="text-graphite">Agreement</span>
            <span className={!isCompleted ? "text-signal-blue" : "text-graphite"}>Content</span>
            <span className={isCompleted ? "text-emerald-status" : ""}>Review</span>
          </div>
        </div>

        {isActive && <DeliverablesPanel collaborationId={collab.id} />}
      </div>

      <div className="bg-linen-canvas border-t border-slate-custom/10 p-4 flex gap-3">
        {isActive && (
          <button onClick={() => complete.mutate(collab.id, { onSuccess: () => notifySuccess("Collaboration completed"), onError: (e: any) => notifyError(e?.response?.data?.message ?? "Could not complete") })} className="flex-1 h-10 rounded-xl bg-gray-900 text-white text-sm font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> Complete
          </button>
        )}
        {isCompleted && !collab.hasReview && (
          <button onClick={() => setReviewing(true)} className="flex-1 h-10 rounded-xl bg-white border border-slate-custom/10 text-graphite text-sm font-bold hover:bg-linen-canvas transition-colors flex items-center justify-center gap-2">
            <Star size={16} /> Write Review
          </button>
        )}
        {isCompleted && collab.hasReview && (
          <div className="flex-1 h-10 rounded-xl bg-emerald-status/10 text-emerald-status text-sm font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> Reviewed
          </div>
        )}
        <button onClick={() => router.push("/messages")} className="h-10 rounded-xl bg-white border border-slate-custom/10 text-graphite text-sm font-bold hover:bg-linen-canvas transition-colors flex items-center justify-center gap-2 flex-1">
          <MessageCircle size={16} /> Chat
        </button>
      </div>

      {reviewing && <ReviewDialog collaborationId={collab.id} onClose={() => setReviewing(false)} />}
    </div>
  );
}

function CollaborationsPageInner() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useBusinessCollaborations({ status: (status || undefined) as any, page, limit: 20 });

  const collabs = data?.items || [];

  const filtered = search.trim()
    ? collabs.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.campaignTitle?.toLowerCase().includes(q) ||
          c.partnerName?.toLowerCase().includes(q)
        );
      })
    : collabs;

  const activeCount = collabs.filter((c) => c.status === "ACTIVE").length;
  const completedCount = collabs.filter((c) => c.status === "COMPLETED").length;
  const pendingReviewCount = collabs.filter((c) => c.status === "COMPLETED" && !c.hasReview).length;
  const totalEarnings = collabs.filter((c) => c.status === "COMPLETED").reduce((sum: number, c) => sum + (c.campaignBudget || 0), 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-graphite">Workspace</h1>
          <p className="text-sm text-ash mt-2 max-w-xl">Manage your active and completed promoter partnerships.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/business/promoters")}
            className="inline-flex items-center gap-2 bg-signal-blue text-white h-11 px-5 rounded-xl text-sm font-semibold hover:opacity-90 transition-colors shadow-product-card-sm"
          >
            <SearchIcon size={16} /> Find Promoters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Active Projects</h3>
            <div className="w-8 h-8 rounded-lg bg-sky-wash text-signal-blue flex items-center justify-center"><Clock size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{activeCount}</div>
          <p className="text-xs font-semibold text-emerald-status mt-1">Current collaborations</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Completed</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-status/10 text-emerald-status flex items-center justify-center"><CheckCircle2 size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{completedCount}</div>
          <p className="text-xs text-fog font-medium mt-1">All time</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Pending Reviews</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-tag flex items-center justify-center"><Star size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{pendingReviewCount}</div>
          <p className="text-xs text-fog font-medium mt-1">Awaiting your feedback</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Total Value</h3>
            <div className="w-8 h-8 rounded-lg bg-sky-wash text-signal-blue flex items-center justify-center"><Wallet size={14} /></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{formatNepaliCurrency(totalEarnings)}</div>
          <p className="text-xs font-semibold text-emerald-status mt-1">From completed projects</p>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-linen-canvas/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="bg-white p-2 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by name or partner..."
                className="w-full h-12 pl-11 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-gray-400 text-graphite"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 pb-1">
            {["All", "Active", "Completed", "Cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s.toLowerCase() === "all" ? "" : s.toUpperCase())}
                className={`whitespace-nowrap px-4 h-8 rounded-full text-xs font-semibold tracking-wide transition-colors border ${status === (s.toLowerCase() === "all" ? "" : s.toUpperCase()) ? "bg-gray-900 text-white border-gray-900" : "bg-white text-ash border-slate-custom/10 hover:bg-linen-canvas"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonCards count={6} />
      ) : isError ? (
        <p className="text-body text-coral-alert">Could not load collaborations.</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-linen-canvas rounded-full flex items-center justify-center text-gray-300 mb-4"><Briefcase size={32} /></div>
          <h2 className="text-xl font-bold text-graphite mb-2">No active projects</h2>
          <p className="text-sm text-ash max-w-sm mb-6">You don't have any collaborations right now. Start by finding new partners.</p>
          <button onClick={() => router.push("/business/promoters")} className="h-11 px-6 flex items-center justify-center rounded-xl bg-signal-blue text-white text-sm font-bold hover:opacity-90 transition-colors shadow-product-card-sm">
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => <CollabCard key={c.id} collab={c} />)}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button variant="ghost" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold ${p === page ? "bg-gray-900 text-white" : "text-ash hover:bg-sky-wash"}`}>{p}</button>
            ))}
          </div>
          <Button variant="ghost" disabled={data.page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

export default function BusinessCollaborationsPage() {
  return (
    <RequireAuth role={Role.BUSINESS}>
      <CollaborationsPageInner />
    </RequireAuth>
  );
}
