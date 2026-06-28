import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useMyReviews, useDeleteReview, useUpdateReview, useMyReceivedReviews, useUserRating } from "../features/reviews/api";
import ReviewFormDialog from "../components/reviews/ReviewFormDialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";

import { motion } from "framer-motion";
import {
  Star, BadgeCheck, Calendar, BarChart3, ChevronLeft, ChevronRight, Briefcase, Edit, Trash2, MessageSquare, Eye
} from "lucide-react";

type TabType = "received" | "given";

export default function MyReviewsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("received");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: ratingData } = useUserRating(user?.id || "");
  const { data: receivedData, isLoading: receivedLoading } = useMyReceivedReviews({ page, limit: 10 });
  const { data: reviewsData, isLoading: reviewsLoading } = useMyReviews({ page, limit: 10 });
  const deleteReview = useDeleteReview();
  const updateReview = useUpdateReview();

  const isLoading = activeTab === "received" ? receivedLoading : reviewsLoading;
  const currentData = activeTab === "received" ? receivedData : reviewsData;

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteReview.mutate(deleteConfirm, {
      onSuccess: () => { notifySuccess("Review deleted"); setDeleteConfirm(null); },
      onError: () => { notifyError("Failed to delete review"); setDeleteConfirm(null); },
    });
  };

  const handleEdit = (data: { rating: number; comment?: string }) => {
    if (!editingId) return;
    updateReview.mutate({ reviewId: editingId, ...data }, {
      onSuccess: () => { notifySuccess("Review updated successfully"); setEditingId(null); },
      onError: () => notifyError("Failed to update review"),
    });
  };

  const currentEditItem = editingId && reviewsData ? reviewsData.items.find((r: any) => r.id === editingId) : null;

  const renderStars = (rating: number) => (
    <div className="flex gap-1 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={16} className={i <= rating ? "fill-amber-400" : "fill-gray-100 text-gray-100"} />
      ))}
    </div>
  );

  const renderRatingDistribution = (distribution: { star_1: number; star_2: number; star_3: number; star_4: number; star_5: number } | undefined) => {
    if (!distribution) return null;
    const total = Object.values(distribution).reduce((sum, v) => sum + v, 0);
    if (total === 0) return <p className="text-xs text-gray-500">No reviews yet</p>;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[`star_${star}` as keyof typeof distribution] as number;
          const pct = (count / total) * 100;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-8 text-gray-600">{star} star</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-right text-gray-500">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      
      {/* Page Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm ring-1 ring-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Reviews</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl">Manage your creator reputation and review history.</p>
        </div>
        <Link
          to={`/profile/${user?.id}`}
          className="inline-flex items-center gap-2 bg-gray-900 text-white h-11 px-5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Eye size={16} /> View Public Profile
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("received")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "received"
              ? "text-brand-purple border-b-2 border-brand-purple"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Ratings Received
        </button>
        <button
          onClick={() => setActiveTab("given")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "given"
              ? "text-brand-purple border-b-2 border-brand-purple"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Reviews Given
        </button>
      </div>

      {/* Stats Overview for Ratings Received Tab */}
      {activeTab === "received" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 flex flex-col items-center justify-center text-center">
            <h2 className="text-sm font-bold text-gray-900 mb-6">Overall Trust Score</h2>
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full border-8 border-amber-100 flex items-center justify-center">
                <span className="text-4xl font-black text-gray-900 tracking-tighter">{ratingData?.average_rating?.toFixed(1) || "0.0"}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <Star size={18} className="fill-white" />
              </div>
            </div>
            {renderStars(Math.round(ratingData?.average_rating || 0))}
            <p className="text-sm font-medium text-gray-500">Based on {ratingData?.total_reviews || 0} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 flex flex-col items-center justify-center text-center">
            <BarChart3 size={32} className="text-gray-300 mb-3" />
            <h2 className="text-sm font-bold text-gray-900 mb-4">Rating Distribution</h2>
            {ratingData?.distribution ? renderRatingDistribution(ratingData.distribution) : <p className="text-xs text-gray-500">Distribution analytics are currently unavailable.</p>}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse ring-1 ring-gray-100" />
            ))}
          </div>
        ) : !currentData || currentData.items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <MessageSquare size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === "received" ? "No reviews received yet" : "No reviews written yet"}
            </h2>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              {activeTab === "received"
                ? "You haven't received any reviews from businesses yet. Complete collaborations to start building your reputation."
                : "You haven't reviewed any businesses yet. Complete a collaboration to leave a review."}
            </p>
            <Link to="/promoter/collaborations" className="h-11 px-6 flex items-center justify-center rounded-xl bg-brand-indigo text-white text-sm font-bold hover:opacity-90 transition-opacity">
              View Collaborations
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentData.items.map((review: any) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-primary-200 transition-all group"
              >
                {activeTab === "received" ? (
                  // Received Review (Ratings Received)
                  <>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-lg font-bold text-gray-700 ring-1 ring-gray-200">
                          {review.reviewer?.username?.charAt(0).toUpperCase() || 'B'}
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-gray-900">{review.reviewer?.full_name || review.reviewer?.username || 'Business'}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Reviewed on {new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-amber-700">{review.rating}.0</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                        "{review.comment || 'No comment provided.'}"
                      </p>
                      {review.comment && review.comment.length > 150 && (
                        <button className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mt-2 hover:underline">Read More</button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
                        <Briefcase size={12} /> {review.campaign_title}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
                        <Calendar size={12} /> {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </>
                ) : (
                  // Given Review (Reviews Given)
                  <>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-lg font-bold text-gray-700 ring-1 ring-gray-200">
                          {review.reviewer?.username?.charAt(0).toUpperCase() || 'B'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="text-base font-medium text-gray-900">{review.target?.full_name || review.target?.username || 'Business Name'}</h3>
                            <BadgeCheck size={14} className="text-blue-500" />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Reviewed on {new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-amber-700">{review.rating}.0</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                        "{review.comment || 'No comment provided.'}"
                      </p>
                      {review.comment && review.comment.length > 150 && (
                        <button className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mt-2 hover:underline">Read More</button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
                        <Briefcase size={12} /> {review.target?.full_name || 'Campaign Name'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
                        <Calendar size={12} /> {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setEditingId(review.id)}
                        className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Edit size={14} /> Edit Review
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(review.id)}
                        className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-brand-coral text-xs font-medium hover:bg-brand-coral-50 hover:border-brand-coral-200 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                      <Link to="/promoter/collaborations" className="h-9 px-4 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors ml-auto flex items-center justify-center">
                        View Collaboration
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {currentData && currentData.pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: currentData.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                    p === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(currentData.pages, p + 1))}
              disabled={page === currentData.pages}
              className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

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

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? The business will no longer see it on their profile."
      />
    </div>
  );
}