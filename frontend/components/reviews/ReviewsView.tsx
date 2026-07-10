"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { RatingStars } from "@/components/reviews/RatingStars";
import {
  useMyReviews,
  useReceivedReviews,
  useUserRating,
  useDeleteReview,
  type ReviewRead,
} from "@/features/reviews/api";
import { useAuth } from "@/providers/AuthProvider";

function ReviewCard({ review, onDelete }: { review: ReviewRead; onDelete?: () => void }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <RatingStars value={review.rating} size="sm" />
          {review.comment && <p className="mt-1 text-body text-slate-custom">{review.comment}</p>}
          <p className="mt-1 text-caption text-steel">
            {review.campaignTitle && `${review.campaignTitle} · `}
            {review.reviewer ? `by ${review.reviewer.fullName || review.reviewer.username}` : ""}
          </p>
        </div>
        {onDelete && (
          <Button variant="ghost" onClick={onDelete}>Delete</Button>
        )}
      </div>
    </Card>
  );
}

export function ReviewsView() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"received" | "written">("received");
  const received = useReceivedReviews({ limit: 20 });
  const mine = useMyReviews({ limit: 20 });
  const rating = useUserRating(user?.id ?? "");
  const del = useDeleteReview();

  const active = tab === "received" ? received : mine;

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Ratings from your collaborations." />

      {rating.data && (
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-display leading-none text-primary">
              {rating.data.averageRating.toFixed(1)}
            </span>
            <div>
              <RatingStars value={rating.data.averageRating} />
              <p className="mt-1 text-caption text-steel">{rating.data.totalReviews} reviews</p>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-4 flex gap-2">
        {(["received", "written"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-pill px-3 py-1.5 text-caption font-medium capitalize ${tab === t ? "bg-primary text-white" : "bg-sky-wash text-graphite hover:bg-steel/10"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {active.isLoading && <Spinner />}
      {active.isError && <p className="text-body text-coral-alert">Could not load reviews.</p>}
      {active.data && active.data.items.length === 0 && (
        <Card><p className="text-body text-steel">No {tab} reviews yet.</p></Card>
      )}
      {active.data && active.data.items.length > 0 && (
        <div className="grid gap-4">
          {active.data.items.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onDelete={
                tab === "written"
                  ? () =>
                      del.mutate(r.id, {
                        onSuccess: () => toast.success("Review deleted"),
                        onError: (e: any) => toast.error(e?.response?.data?.message ?? "Delete failed"),
                      })
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
