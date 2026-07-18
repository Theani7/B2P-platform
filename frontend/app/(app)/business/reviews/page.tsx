"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { useAuth } from "@/providers/AuthProvider";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Card, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonList } from "@/components/ui/Skeleton";
import { RatingStars } from "@/components/reviews/RatingStars";
import {
  useMyReviews,
  useReceivedReviews,
  useUserRating,
  useDeleteReview,
  useUpdateReview,
  type ReviewRead,
} from "@/features/reviews/api";
import { Star, Calendar, Briefcase, Edit, Trash2, ChevronRight, MessageSquare, Eye } from "lucide-react";

type TabType = "received" | "given";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-amber-tag">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={16} className={i <= rating ? "fill-amber-tag" : "fill-slate-custom/10 text-slate-custom/10"} />
      ))}
    </div>
  );
}

function Distribution({ distribution }: { distribution: Record<string, number> | undefined }) {
  if (!distribution) return <p className="text-xs text-ash">No reviews yet</p>;
  const total = Object.values(distribution).reduce((s, v) => s + v, 0);
  if (total === 0) return <p className="text-xs text-ash">No reviews yet</p>;
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = (distribution[`star_${star}`] as number) ?? 0;
        const pct = (count / total) * 100;
        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-8 text-graphite font-medium">{star} star</span>
            <div className="flex-1 h-2 bg-slate-custom/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-tag rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right text-ash font-medium">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function EditModal({ review, onClose }: { review: ReviewRead; onClose: () => void }) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? "");
  const update = useUpdateReview();
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-modals bg-white p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-heading-sm font-semibold text-midnight-ink">Edit review</h2>
        <div className="mt-4">
          <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Rating</span>
          <RatingStars value={rating} onChange={setRating} />
        </div>
        <label className="mt-4 block">
          <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Comment</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={update.isPending}
            onClick={() =>
              update.mutate(
                { reviewId: review.id, data: { rating, comment: comment || undefined } },
                { onSuccess: () => { notifySuccess("Review updated"); onClose(); }, onError: (e: any) => notifyError(e?.response?.data?.message ?? "Failed") },
              )
            }
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BusinessReviewsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>("received");
  const [editing, setEditing] = useState<ReviewRead | null>(null);

  const { data: rating } = useUserRating(user?.id ?? "");
  const received = useReceivedReviews({ limit: 20 });
  const mine = useMyReviews({ limit: 20 });
  const del = useDeleteReview();

  const active = tab === "received" ? received : mine;
  const items = active.data?.items ?? [];

  const handleDelete = (id: string) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    del.mutate(id, { onSuccess: () => notifySuccess("Review deleted"), onError: (e: any) => notifyError(e?.response?.data?.message ?? "Failed") });
  };

  return (
    <RequireAuth role={Role.BUSINESS}>
      <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-cards shadow-product-card border border-slate-custom/10">
          <div>
            <h1 className="text-heading-lg text-graphite font-bold tracking-tight">My Reviews</h1>
            <p className="text-sm text-ash mt-2 max-w-xl">Manage your creator reputation and review history.</p>
          </div>
          <a
            href={`/profile/${user?.id}`}
            className="bg-white border border-slate-custom/10 text-graphite rounded-inputs px-5 h-11 text-sm font-semibold hover:bg-sky-wash transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Eye size={16} /> View Public Profile
          </a>
        </div>

        <div className="flex gap-1 border-b border-slate-custom/10">
          {(["received", "given"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-bold transition-colors ${tab === t ? "text-signal-blue border-b-2 border-signal-blue" : "text-ash hover:bg-sky-wash hover:text-graphite rounded-t-lg"}`}
            >
              {t === "received" ? "Ratings Received" : "Reviews Given"}
            </button>
          ))}
        </div>

        {tab === "received" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-custom/10 shadow-product-card rounded-cards p-8 flex flex-col items-center justify-center text-center">
              <h2 className="text-base font-bold text-graphite mb-6">Overall Trust Score</h2>
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full border-[12px] border-amber-tag/10 flex items-center justify-center bg-white shadow-sm">
                  <span className="text-5xl font-black text-graphite tracking-tighter">{rating?.averageRating?.toFixed(1) || "0.0"}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-amber-tag text-white w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <Star size={20} className="fill-white" />
                </div>
              </div>
              <Stars rating={Math.round(rating?.averageRating || 0)} />
              <p className="text-xs font-semibold uppercase tracking-wider text-ash mt-3">Based on {rating?.totalReviews || 0} reviews</p>
            </div>
            <div className="bg-white border border-slate-custom/10 shadow-product-card rounded-cards p-8 flex flex-col items-center justify-center text-center">
              <div className="w-9 h-9 text-slate-custom/20 mb-4"><Star size={36} /></div>
              <h2 className="text-base font-bold text-graphite mb-6">Rating Distribution</h2>
              <div className="w-full max-w-xs">
                <Distribution distribution={rating?.distribution} />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {active.isLoading ? (
            <SkeletonList count={3} rowHeight="h-48" />
          ) : items.length === 0 ? (
            <div className="bg-white rounded-cards border border-slate-custom/10 shadow-product-card p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-sky-wash rounded-full flex items-center justify-center text-signal-blue mb-4">
                <MessageSquare size={32} />
              </div>
              <h2 className="text-heading font-bold text-graphite mb-2">
                {tab === "received" ? "No reviews received yet" : "No reviews written yet"}
              </h2>
              <p className="text-sm text-ash max-w-md mb-8">
                {tab === "received"
                  ? "You haven't received any reviews from promoters yet. Complete collaborations to start building your reputation."
                  : "You haven't reviewed any businesses yet. Complete a collaboration to leave a review."}
              </p>
              <a href="/business/collaborations" className="bg-signal-blue text-white rounded-inputs px-6 h-12 flex items-center justify-center text-sm font-bold hover:bg-signal-blue/90 transition-colors shadow-sm">
                View Collaborations
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((r) => (
                <div key={r.id} className="bg-white rounded-cards border border-slate-custom/10 shadow-product-card p-6 transition-all hover:border-signal-blue/30">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-periwinkle-glow/30 flex items-center justify-center text-base font-bold text-signal-blue">
                        {(tab === "received" ? r.reviewer?.username : r.businessName)?.charAt(0).toUpperCase() || "B"}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-graphite">{tab === "received" ? r.reviewer?.username : r.businessName}</h3>
                        <p className="text-xs font-semibold text-ash uppercase tracking-wider mt-1">Reviewed on {new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-tag/10 rounded-inputs border border-amber-tag/20">
                      <Star size={16} className="fill-amber-tag text-amber-tag" />
                      <span className="text-sm font-bold text-amber-tag">{r.rating}.0</span>
                    </div>
                  </div>

                  <div className="bg-linen-canvas rounded-inputs p-5 border border-slate-custom/10 mb-5">
                    <p className="text-sm font-medium text-graphite leading-relaxed">"{r.comment || "No comment provided."}"</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-inputs text-xs font-bold bg-white text-graphite border border-slate-custom/10 shadow-sm">
                      <Briefcase size={14} className="text-ash" /> {r.campaignTitle}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-inputs text-xs font-bold bg-white text-graphite border border-slate-custom/10 shadow-sm">
                      <Calendar size={14} className="text-ash" /> {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {tab === "given" && (
                    <div className="flex items-center gap-3 pt-5 border-t border-slate-custom/10 mt-5">
                      <button
                        onClick={() => setEditing(r)}
                        className="bg-white border border-slate-custom/10 text-graphite rounded-inputs h-10 px-5 text-xs font-bold hover:bg-sky-wash transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Edit size={14} /> Edit Review
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="bg-white text-coral-alert border border-slate-custom/10 rounded-inputs h-10 px-5 text-xs font-bold hover:bg-coral-alert/10 hover:border-coral-alert/30 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                      <a href="/business/collaborations" className="ml-auto text-signal-blue font-bold text-sm hover:underline flex items-center gap-1">
                        View Collaboration <ChevronRight size={16} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {editing && <EditModal review={editing} onClose={() => setEditing(null)} />}
      </div>
    </RequireAuth>
  );
}
