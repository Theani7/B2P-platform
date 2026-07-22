"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";
import { StatCard } from "@/components/ui/Stats";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Badge as ToneBadge } from "@/components/ui/Card";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";
import { Portal } from "@/components/ui/Portal";
import {
  usePromoterCollaborations,
  usePromoterDeliverables,
  useSubmitDeliverable,
  type Collaboration,
} from "@/features/collaborations/api";
import { useCompleteCollaboration } from "@/features/reviews/api";
import {
  CheckCircle2,
  XCircle,
  Star,
  MessageCircle,
  Briefcase,
  Building2,
  Search as SearchIcon,
  Link2,
  FileText,
  ExternalLink,
  CalendarDays,
} from "lucide-react";

const fmtNpr = (n?: number | null) =>
  "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

const deliverableTone: Record<string, "slate" | "signal" | "emerald" | "coral" | "amber"> = {
  DRAFT: "slate",
  IN_REVIEW: "signal",
  APPROVED: "emerald",
  REVISION_REQUESTED: "coral",
  PUBLISHED: "emerald",
};

function DeliverablesPanel({ collaborationId }: { collaborationId: string }) {
  const { data, isLoading } = usePromoterDeliverables(collaborationId);
  const submit = useSubmitDeliverable();
  const [form, setForm] = useState({ title: "", description: "", contentUrl: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit.mutate(
      { collaborationId, data: { title: form.title.trim(), description: form.description || undefined, contentUrl: form.contentUrl.trim() } },
      {
        onSuccess: () => {
          notifySuccess("Deliverable submitted");
          setForm({ title: "", description: "", contentUrl: "" });
        },
        onError: (e: any) => notifyError(e?.response?.data?.message ?? "Could not submit"),
      },
    );
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
        <div className="bg-linen-canvas rounded-xl p-6 text-center border border-dashed border-steel/20 mb-4">
          <div className="w-10 h-10 mx-auto bg-white rounded-full flex items-center justify-center text-steel mb-3 shadow-sm ring-1 ring-gray-100">
            <FileText size={18} />
          </div>
          <p className="text-sm font-medium text-graphite mb-1">No deliverables yet</p>
          <p className="text-xs text-ash">Submit your work below for review.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="mb-4 grid gap-3">
          {data.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-custom/10 shadow-sm overflow-hidden flex flex-col p-4">
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
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-fog uppercase tracking-widest mb-1.5">Description</p>
                  <p className="text-xs text-ash leading-relaxed bg-linen-canvas/50 p-2.5 rounded-lg border border-slate-custom/5">{d.description}</p>
                </div>
              )}
              
              {d.feedback && (
                <div className="mt-2 bg-coral-alert/5 p-2.5 rounded-lg border border-coral-alert/20 flex gap-2">
                  <MessageCircle size={14} className="text-coral-alert shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-coral-alert uppercase tracking-widest mb-0.5">Business Feedback</p>
                    <p className="text-xs text-coral-alert/90 font-medium">{d.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-linen-canvas rounded-xl p-4 border border-slate-custom/10">
        <h5 className="text-[11px] font-bold text-fog uppercase tracking-widest mb-3">Submit New Deliverable</h5>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <input
            className="w-full h-10 rounded-inputs border border-slate-custom/10 bg-white px-3 text-sm text-graphite placeholder-fog outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue/20 transition-all shadow-sm"
            placeholder="Title (e.g., Draft Instagram Reel)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            minLength={3}
            maxLength={100}
            required
          />
          <input
            className="w-full h-10 rounded-inputs border border-slate-custom/10 bg-white px-3 text-sm text-graphite placeholder-fog outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue/20 transition-all shadow-sm"
            placeholder="Content URL (Google Drive, Dropbox, etc)"
            type="url"
            value={form.contentUrl}
            onChange={(e) => setForm((f) => ({ ...f, contentUrl: e.target.value }))}
            required
          />
          <textarea
            className="w-full min-h-[80px] rounded-inputs border border-slate-custom/10 bg-white px-3 py-2 text-sm text-graphite placeholder-fog outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue/20 transition-all shadow-sm resize-y"
            placeholder="Description or notes (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            maxLength={1000}
          />
          <Button type="submit" disabled={submit.isPending} className="w-full h-10 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-inputs shadow-sm">
            {submit.isPending ? "Submitting..." : "Submit Deliverable"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function CollabCard({
  collab,
  onComplete,
  onReview,
  onOpenChat,
}: {
  collab: Collaboration;
  onComplete: (id: string) => void;
  onReview: (id: string) => void;
  onOpenChat: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isActive = collab.status === "ACTIVE";
  const isCompleted = collab.status === "COMPLETED";

  const progress = () => {
    if (isCompleted) return 100;
    if (!collab.campaignStartDate || !collab.campaignEndDate) return 50;
    const start = new Date(collab.campaignStartDate).getTime();
    const end = new Date(collab.campaignEndDate).getTime();
    const now = Date.now();
    return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
  };
  const pct = progress();
  const daysLeft = collab.campaignEndDate
    ? Math.max(0, Math.ceil((new Date(collab.campaignEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="bg-white rounded-cards-lg shadow-product-card border border-slate-custom/10 hover:shadow-product-card hover:border-signal-blue/30 transition-all group flex flex-col overflow-hidden">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={collab.partnerAvatarUrl ?? undefined}
              initials={(collab.partnerName || "??").slice(0, 2).toUpperCase()}
              size="md"
              colorIndex={1}
            />
            <div className="min-w-0">
              <h3 className="text-base font-bold text-graphite truncate pr-2">{collab.campaignTitle}</h3>
              <p className="text-sm text-ash flex items-center gap-1.5 truncate mt-0.5">
                <Building2 size={14} /> {collab.partnerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={isActive ? "open" : isCompleted ? "completed" : "pending"}>{collab.status}</Badge>
            <button
              onClick={() => setOpen((o) => !o)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-fog hover:bg-sky-wash hover:text-graphite transition-colors border border-slate-custom/10 bg-white shadow-product-card-sm"
            >
              <CheckCircle2 size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-sky-wash/50 rounded-inputs p-3 border border-slate-custom/10">
            <p className="text-[11px] font-bold text-fog uppercase tracking-widest mb-1">Budget</p>
            <p className="text-sm font-bold text-graphite">{fmtNpr(collab.campaignBudget)}</p>
          </div>
          <div className="bg-sky-wash/50 rounded-inputs p-3 border border-slate-custom/10">
            <p className="text-[11px] font-bold text-fog uppercase tracking-widest mb-1">Timeline</p>
            <p className="text-sm font-bold text-graphite">
              {isCompleted ? "Completed" : daysLeft != null ? `${daysLeft} days left` : "Ongoing"}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-graphite">Project Progress</span>
            <span className={isCompleted ? "text-emerald-status" : "text-signal-blue"}>{pct}%</span>
          </div>
          <div className="h-2 w-full bg-sky-wash rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-status" : "bg-signal-blue"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-fog uppercase tracking-widest mt-2">
            <span className="text-graphite">Agreement</span>
            <span className={!isCompleted ? "text-signal-blue" : "text-graphite"}>Content</span>
            <span className={isCompleted ? "text-emerald-status" : ""}>Review</span>
          </div>
        </div>

        {isActive && (
          <div className="mt-4 border-t border-slate-custom/10 pt-2">
            <DeliverablesPanel collaborationId={collab.id} />
          </div>
        )}
      </div>

      <div className="bg-linen-canvas border-t border-slate-custom/10 p-4 flex gap-3">
        {isActive && (
          <Button variant="primary" className="flex-1" onClick={() => onComplete(collab.id)}>
            <CheckCircle2 size={16} /> Complete
          </Button>
        )}
        {isCompleted && !collab.hasReview && (
          <Button variant="subtle" className="flex-1" onClick={() => onReview(collab.id)}>
            <Star size={16} /> Write Review
          </Button>
        )}
        {isCompleted && collab.hasReview && (
          <div className="flex-1 h-10 rounded-inputs bg-emerald-status/10 text-emerald-status text-sm font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> Reviewed
          </div>
        )}
        <Button variant="ghost" onClick={() => onOpenChat(collab.id)}>
          <MessageCircle size={16} /> Chat
        </Button>
      </div>
    </div>
  );
}

function PromoterCollaborationsInner() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null);

  const { data, isLoading, isError } = usePromoterCollaborations({
    page,
    limit: 10,
    status: statusFilter !== "all" ? (statusFilter.toUpperCase() as any) : undefined,
  });
  const completeCollab = useCompleteCollaboration();

  const collabs = data?.items ?? [];
  const filtered = search
    ? collabs.filter(
        (c) =>
          c.campaignTitle.toLowerCase().includes(search.toLowerCase()) ||
          c.partnerName.toLowerCase().includes(search.toLowerCase()),
      )
    : collabs;
  const activeCount = filtered.filter((c) => c.status === "ACTIVE").length;
  const completedCount = filtered.filter((c) => c.status === "COMPLETED").length;
  const pendingReviewCount = filtered.filter((c) => c.status === "COMPLETED" && !c.hasReview).length;
  const totalValue = filtered.filter((c) => c.status === "COMPLETED").reduce((s, c) => s + (c.campaignBudget || 0), 0);

  const confirmComplete = () => {
    if (!completeConfirm) return;
    completeCollab.mutate(completeConfirm, {
      onSuccess: () => {
        notifySuccess("Project marked as complete!");
        setCompleteConfirm(null);
      },
      onError: () => notifyError("Failed to complete project"),
    });
  };

  const openChat = (id: string) => router.push(`/messages?collaborationId=${id}`);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-cards-lg shadow-product-card border border-slate-custom/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-graphite">Workspace</h1>
          <p className="text-sm text-ash mt-2 max-w-xl">Manage your active and completed brand partnerships.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/promoter/marketplace"
            className="inline-flex items-center gap-2 bg-signal-blue text-white h-11 px-5 rounded-inputs text-sm font-semibold hover:opacity-90 transition-colors shadow-product-card-sm"
          >
            <SearchIcon size={16} /> Browse Campaigns
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Projects" value={activeCount} hint="partnerships" />
        <StatCard label="Completed" value={completedCount} hint="all time" />
        <StatCard label="Pending Reviews" value={pendingReviewCount} hint="awaiting feedback" />
        <StatCard label="Total Value" value={fmtNpr(totalValue)} hint="from completed" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-12 space-y-6">
          <div className="sticky top-0 z-30 bg-linen-canvas/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="bg-white p-2 rounded-cards shadow-product-card border border-slate-custom/10 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog" />
                  <input
                    type="text"
                    placeholder="Search projects by name or partner..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-fog text-graphite"
                  />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto px-2 pb-1">
                {["All", "Active", "Completed", "Cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status.toLowerCase());
                      setPage(1);
                    }}
                    className={`whitespace-nowrap px-4 h-8 rounded-pill text-xs font-semibold tracking-wide transition-colors border ${
                      statusFilter === status.toLowerCase()
                        ? "bg-graphite text-white border-graphite"
                        : "bg-white text-ash border-slate-custom/10 hover:bg-sky-wash"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <SkeletonCards count={6} />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-cards bg-coral-alert/10 flex items-center justify-center mb-4">
                <XCircle size={32} className="text-coral-alert" />
              </div>
              <p className="text-lg font-medium text-graphite">Error loading workspace</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-cards-lg shadow-product-card border border-slate-custom/10 p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-linen-canvas rounded-full flex items-center justify-center text-ash mb-4">
                <Briefcase size={32} />
              </div>
              <h2 className="text-xl font-bold text-graphite mb-2">No active projects</h2>
              <p className="text-sm text-ash max-w-sm mb-6">You don&apos;t have any collaborations right now. Start by finding new partners.</p>
              <Link
                href="/promoter/marketplace"
                className="h-11 px-6 flex items-center justify-center rounded-inputs bg-signal-blue text-white text-sm font-bold hover:opacity-90 transition-colors shadow-product-card-sm"
              >
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c) => (
                <CollabCard
                  key={c.id}
                  collab={c}
                  onComplete={setCompleteConfirm}
                  onReview={setReviewingId}
                  onOpenChat={openChat}
                />
              ))}
            </div>
          )}

          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-10 px-4 rounded-inputs border border-slate-custom/10 text-sm font-semibold hover:bg-sky-wash disabled:opacity-50"
              >
                Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-inputs text-sm font-bold ${p === page ? "bg-graphite text-white" : "text-ash hover:bg-sky-wash"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="h-10 px-4 rounded-inputs border border-slate-custom/10 text-sm font-semibold hover:bg-sky-wash disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {reviewingId && <ReviewDialog collaborationId={reviewingId} onClose={() => setReviewingId(null)} />}

      {completeConfirm && (
        <Portal>
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4">
            <div className="bg-white border border-slate-custom/10 rounded-cards-lg p-8 shadow-xl max-w-sm w-full">
              <h3 className="text-xl font-bold text-graphite mb-3">Mark Complete</h3>
              <p className="text-sm font-medium text-ash leading-relaxed mb-8">
                Are you sure you want to mark this collaboration as complete? This will notify your partner and move the project to the review phase.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setCompleteConfirm(null)}
                  className="px-5 py-2.5 text-sm font-bold text-graphite bg-white border border-slate-custom/10 rounded-inputs hover:bg-sky-wash"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmComplete}
                  disabled={completeCollab.isPending}
                  className="px-6 py-2.5 text-sm font-bold text-white rounded-inputs bg-signal-blue hover:opacity-90 disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

export default function PromoterCollaborationsPage() {
  return (
    <RequireAuth role={Role.PROMOTER}>
      <PromoterCollaborationsInner />
    </RequireAuth>
  );
}
