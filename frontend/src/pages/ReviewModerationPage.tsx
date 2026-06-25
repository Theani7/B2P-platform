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
      <h1 className="text-2xl font-bold text-text">Review Moderation</h1>

      <input type="text" placeholder="Search reviews..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="rounded border px-3 py-2 text-sm w-full max-w-md" />

      {!data || data.items.length === 0 ? (
        <EmptyState title="No reviews" description="No reviews found." />
      ) : (
        <div className="space-y-4">
          {data.items.map((r) => (
            <div key={r.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <RatingStars rating={r.rating} size="sm" />
                    <span className="text-sm font-medium text-text ml-1">{r.rating}/5</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(r.id)} className="text-xs text-danger hover:underline">Delete</button>
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                <span>By: {r.reviewer_username}</span>
                <span>&middot;</span>
                <span>For: {r.reviewee_username}</span>
                <span>&middot;</span>
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
