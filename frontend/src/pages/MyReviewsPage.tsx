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
        <Star key={i} size={16} className={i <= rating ? "fill-amber-400" : "fill-sky-wash text-sky-wash"} />
      ))}
    </div>
  );

  const renderRatingDistribution = (distribution: { star_1: number; star_2: number; star_3: number; star_4: number; star_5: number } | undefined) => {
    if (!distribution) return null;
    const total = Object.values(distribution).reduce((sum, v) => sum + v, 0);
    if (total === 0) return <p className="text-xs text-ash">No reviews yet</p>;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[`star_${star}` as keyof typeof distribution] as number;
          const pct = (count / total) * 100;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-8 text-graphite">{star} star</span>
              <div className="flex-1 h-1.5 bg-sky-wash rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-right text-ash">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      
      {/* Page Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-cards-lg shadow-product-card-product-card-product-card border border-slate-custom/10">
        <div>
          <h1 className="text-heading-lg text-graphite">My Reviews</h1>
          <p className="text-sm text-ash mt-2 max-w-xl">Manage your creator reputation and review history.</p>
        </div>
        <Link
          to={`/profile/${user?.id}`}
          className="inline-flex items-center gap-2 bg-gray-900 text-white h-11 px-5 rounded-inputs text-sm font-semibold hover:bg-gray-800 transition-colors shadow-product-card-product-card-sm"
        >
          <Eye size={16} /> View Public Profile
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-slate-custom/10">
        <button
          onClick={() => setActiveTab("received")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "received"
              ? "text-signal-blue border-b-2 border-signal-blue"
              : "text-ash hover:text-graphite"
          }`}
        >
          Ratings Received
        </button>
        <button
          onClick={() => setActiveTab("given")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "given"
              ? "text-signal-blue border-b-2 border-signal-blue"
              : "text-ash hover:text-graphite"
          }`}
        >
          Reviews Given
        </button>
      </div>

      {/* Stats Overview for Ratings Received Tab */}
      {activeTab === "received" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="bg-white rounded-cards-lg shadow-product-card-product-card-product-card border border-slate-custom/10 p-8 flex flex-col items-center justify-center text-center">
            <h2 className="text-sm font-bold text-graphite mb-6">Overall Trust Score</h2>
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full border-8 border-amber-tag/10 flex items-center justify-center">
                <span className="text-4xl font-black text-graphite">{ratingData?.average_rating?.toFixed(1) || "0.0"}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-product-card-product-card-sm">
                <Star size={18} className="fill-white" />
              </div>
            </div>
            {renderStars(Math.round(ratingData?.average_rating || 0))}
            <p className="text-sm font-medium text-ash">Based on {ratingData?.total_reviews || 0} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-cards-lg shadow-product-card-product-card-product-card border border-slate-custom/10 p-8 flex flex-col items-center justify-center text-center">
            <BarChart3 size={32} className="text-slate-custom/10 mb-3" />
            <h2 className="text-sm font-bold text-graphite mb-4">Rating Distribution</h2>
            {ratingData?.distribution ? renderRatingDistribution(ratingData.distribution) : <p className="text-xs text-ash">Distribution analytics are currently unavailable.</p>}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-cards-lg h-48 animate-pulse shadow-product-card-product-card-product-card" />
            ))}
          </div>
        ) : !currentData || currentData.items.length === 0 ? (
          <div className="bg-white rounded-cards-lg shadow-product-card-product-card-product-card border border-slate-custom/10 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-linen-canvas rounded-full flex items-center justify-center text-ash mb-4">
              <MessageSquare size={32} />
            </div>
            <h2 className="text-heading text-graphite mb-2">
              {activeTab === "received" ? "No reviews received yet" : "No reviews written yet"}
            </h2>
            <p className="text-sm text-ash max-w-sm mb-6">
              {activeTab === "received"
                ? "You haven't received any reviews from businesses yet. Complete collaborations to start building your reputation."
                : "You haven't reviewed any businesses yet. Complete a collaboration to leave a review."}
            </p>
            <Link to="/promoter/collaborations" className="h-11 px-6 flex items-center justify-center rounded-inputs bg-signal-blue text-white text-sm font-bold hover:opacity-90 transition-opacity">
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
                className="bg-white rounded-cards-lg shadow-product-card-product-card-product-card border border-slate-custom/10 hover:shadow-product-card-product-card-product-card transition-all group"
              >
                {activeTab === "received" ? (
                  // Received Review
                  <>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-button bg-linen-canvas flex items-center justify-center text-lg font-bold text-graphite shadow-product-card-product-card-sm border border-slate-custom/10">
                          {review.reviewer?.username?.charAt(0).toUpperCase() || 'B'}
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-graphite">{review.business_name}</h3>
                          <p className="text-xs text-ash mt-0.5">Reviewed on {new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-tag/10 rounded-inputs border border-amber-tag/20">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-amber-tag">{review.rating}.0</span>
                      </div>
                    </div>

                    <div className="bg-linen-canvas rounded-inputs p-4 border border-slate-custom/10 mb-4">
                      <p className="text-sm text-graphite leading-relaxed line-clamp-4">
                        "{review.comment || 'No comment provided.'}"
                      </p>
                      {review.comment && review.comment.length > 150 && (
                        <button className="text-[10px] font-bold text-signal-blue uppercase tracking-widest mt-2 hover:underline">Read More</button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-graphite bg-white border border-slate-custom/10 px-2.5 py-1 rounded-inputs shadow-product-card-product-card-sm">
                        <Briefcase size={12} /> {review.campaign_title}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-graphite bg-white border border-slate-custom/10 px-2.5 py-1 rounded-inputs shadow-product-card-product-card-sm">
                        <Calendar size={12} /> {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </>
                ) : (
                  // Given Review
                  <>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-button bg-linen-canvas flex items-center justify-center text-lg font-bold text-graphite shadow-product-card-product-card-sm border border-slate-custom/10">
                          {review.reviewer?.username?.charAt(0).toUpperCase() || 'B'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="text-base font-medium text-graphite">{review.business_name}</h3>
                            <BadgeCheck size={14} className="text-signal-blue" />
                          </div>
                          <p className="text-xs text-ash mt-0.5">Reviewed on {new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-tag/10 rounded-inputs border border-amber-tag/20">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-amber-tag">{review.rating}.0</span>
                      </div>
                    </div>

                    <div className="bg-linen-canvas rounded-inputs p-4 border border-slate-custom/10 mb-4">
                      <p className="text-sm text-graphite leading-relaxed line-clamp-4">
                        "{review.comment || 'No comment provided.'}"
                      </p>
                      {review.comment && review.comment.length > 150 && (
                        <button className="text-[10px] font-bold text-signal-blue uppercase tracking-widest mt-2 hover:underline">Read More</button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-graphite bg-white border border-slate-custom/10 px-2.5 py-1 rounded-inputs shadow-product-card-product-card-sm">
                        <Briefcase size={12} /> {review.campaign_title}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-graphite bg-white border border-slate-custom/10 px-2.5 py-1 rounded-inputs shadow-product-card-product-card-sm">
                        <Calendar size={12} /> {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-custom/10">
                      <button
                        onClick={() => setEditingId(review.id)}
                        className="h-9 px-4 rounded-inputs bg-white border border-slate-custom/10 text-graphite text-xs font-medium hover:bg-sky-wash transition-colors flex items-center gap-1.5 shadow-product-card-product-card-sm"
                      >
                        <Edit size={14} /> Edit Review
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(review.id)}
                        className="h-9 px-4 rounded-inputs bg-white border border-slate-custom/10 text-coral-alert text-xs font-medium hover:bg-coral-alert/10 hover:border-coral-alert/20 transition-colors flex items-center gap-1.5 shadow-product-card-product-card-sm"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                      <Link to="/promoter/collaborations" className="h-9 px-4 rounded-inputs bg-linen-canvas text-ash text-xs font-medium hover:bg-sky-wash transition-colors ml-auto flex items-center justify-center">
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
              className="h-10 px-4 rounded-inputs border border-slate-custom/10 text-sm font-medium hover:bg-sky-wash disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: currentData.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-inputs text-sm font-medium transition-colors ${
                    p === page ? 'bg-graphite text-white' : 'text-ash hover:bg-sky-wash'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(currentData.pages, p + 1))}
              disabled={page === currentData.pages}
              className="h-10 px-4 rounded-inputs border border-slate-custom/10 text-sm font-medium hover:bg-sky-wash disabled:opacity-50 transition-colors"
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
