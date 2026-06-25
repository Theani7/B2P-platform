import { useState } from "react";
import { useMyReviews, useDeleteReview, useUpdateReview } from "../features/reviews/api";
import RatingStars from "../components/reviews/RatingStars";
import ReviewFormDialog from "../components/reviews/ReviewFormDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function MyReviewsPage() {
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data, isLoading } = useMyReviews({ page, limit: 20 });
  const deleteReview = useDeleteReview();
  const updateReview = useUpdateReview();

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="Your reviews will appear here once you review a completed collaboration."
      />
    );
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this review?")) return;
    deleteReview.mutate(id, {
      onSuccess: () => notifySuccess("Review deleted"),
      onError: () => notifyError("Failed to delete review"),
    });
  };

  const handleEdit = (data: { rating: number; comment?: string }) => {
    if (!editingId) return;
    updateReview.mutate({ reviewId: editingId, ...data }, {
      onSuccess: () => {
        notifySuccess("Review updated");
        setEditingId(null);
      },
      onError: () => notifyError("Failed to update review"),
    });
  };

  const currentEditItem = editingId ? data.items.find((r) => r.id === editingId) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">My Reviews</h1>

      <div className="space-y-4">
        {data.items.map((review) => (
          <div key={review.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {review.reviewer.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-text">{review.reviewer.full_name}</p>
                  <p className="text-xs text-gray-500">@{review.reviewer.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <RatingStars rating={review.rating} size="sm" />
                <span className="text-sm font-medium text-text">{review.rating}/5</span>
              </div>
            </div>

            {review.comment && (
              <p className="mt-3 text-sm text-gray-700">{review.comment}</p>
            )}

            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingId(review.id)}
                  className="text-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="text-danger hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {data.page} of {data.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page >= data.pages}
            className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {currentEditItem && (
        <ReviewFormDialog
          open={!!editingId}
          onClose={() => setEditingId(null)}
          onSubmit={handleEdit}
          initialRating={currentEditItem.rating}
          initialComment={currentEditItem.comment || ""}
          title="Edit Review"
        />
      )}
    </div>
  );
}
