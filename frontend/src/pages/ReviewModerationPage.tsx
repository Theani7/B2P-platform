import { useState } from "react";
import { useAdminReviews, useAdminDeleteReview } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import RatingStars from "../components/reviews/RatingStars";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function ReviewModerationPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminReviews({ page, limit: 20, search: search || undefined });
  const deleteReview = useAdminDeleteReview();

  if (isLoading) return <LoadingSpinner />;

  const handleDelete = (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    deleteReview.mutate(reviewId, {
      onSuccess: () => notifySuccess("Review deleted"),
      onError: () => notifyError("Failed to delete review"),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-stone-900 font-stretch-condensed">Review Moderation</h1>

      <input type="text" placeholder="Search reviews..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="rounded-lg border border-stone-100 px-3 py-2 text-sm w-full max-w-md text-stone-900" />

      {!data || data.items.length === 0 ? (
        <EmptyState title="No reviews" description="No reviews found." />
      ) : (
        <div className="space-y-4">
          {data.items.map((r) => (
            <div key={r.id} className="rounded-xl border border-stone-100 bg-white p-5 border-t-[1px] border-t-brand-purple">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <RatingStars rating={r.rating} size="sm" />
                    <span className="text-sm font-medium text-stone-900 ml-1">{r.rating}/5</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(r.id)} className="text-xs text-brand-coral hover:underline">Delete</button>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-stone-500">
                <span>By: {r.reviewer_username}</span>
                <span>&middot;</span>
                <span>For: {r.reviewee_username}</span>
                <span>&middot;</span>
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="mt-3 text-sm text-stone-900">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-stone-100 bg-white px-3 py-1.5 text-sm text-stone-900 hover:bg-stone-50 disabled:opacity-50 transition-colors">Previous</button>
          <span className="text-sm text-stone-500">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-lg border border-stone-100 bg-white px-3 py-1.5 text-sm text-stone-900 hover:bg-stone-50 disabled:opacity-50 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}
