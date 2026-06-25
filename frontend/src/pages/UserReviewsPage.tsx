import { useState } from "react";
import { useParams } from "react-router-dom";
import { useUserReviews, useUserRating } from "../features/reviews/api";
import RatingStars from "../components/reviews/RatingStars";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function UserReviewsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserReviews(userId!, { page, limit: 20 });
  const { data: ratingSummary } = useUserRating(userId!);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Reviews</h1>

      {ratingSummary && ratingSummary.total_reviews > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-text">{ratingSummary.average_rating}</div>
              <RatingStars rating={ratingSummary.average_rating} size="sm" />
              <p className="mt-1 text-sm text-gray-500">{ratingSummary.total_reviews} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = (ratingSummary.distribution as any)[`star_${star}`] || 0;
                const pct = ratingSummary.total_reviews > 0 ? (count / ratingSummary.total_reviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-right text-gray-600">{star}</span>
                    <RatingStars rating={star} size="sm" />
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!data || data.items.length === 0 ? (
        <EmptyState title="No reviews yet" description="This user has not received any reviews." />
      ) : (
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
              <p className="mt-2 text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
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
    </div>
  );
}
