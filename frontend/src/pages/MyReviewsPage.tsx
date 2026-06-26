import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useMyReviews, useDeleteReview, useUpdateReview, useUserRating } from "../features/reviews/api";
import ReviewFormDialog from "../components/reviews/ReviewFormDialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";

import { motion } from "framer-motion";
import {
  Star, BadgeCheck, Calendar, Award, Medal, Sparkles, MessageSquare, Eye, Edit, Trash2,
  BarChart3, Search, ChevronLeft, ChevronRight, Briefcase, CheckCircle2
} from "lucide-react";

export default function MyReviewsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: ratingData } = useUserRating(user?.id || "");
  const { data: reviewsData, isLoading } = useMyReviews({ page, limit: 10 });
  const deleteReview = useDeleteReview();
  const updateReview = useUpdateReview();

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

  const currentEditItem = editingId && reviewsData ? reviewsData.items.find((r:any) => r.id === editingId) : null;

  // Mock distribution removed as API doesn't provide it yet

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      
      {/* 1. PREMIUM HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm ring-1 ring-gray-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50/50 via-white to-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Reputation</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl">Manage your creator reputation, track your performance, and review past client feedback.</p>
        </div>
        <div className="flex items-center gap-3">

          <Link
            to={`/profile/${user?.id}`}
            className="inline-flex items-center gap-2 bg-gray-900 text-white h-11 px-5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Eye size={16} /> View Public Profile
          </Link>
        </div>
      </div>

      {/* 2. REPUTATION OVERVIEW & DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Score Card */}
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
          <div className="flex gap-1 mb-2 text-amber-400">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={20} className={i <= Math.round(ratingData?.average_rating || 0) ? "fill-amber-400" : "fill-gray-100 text-gray-100"} />
            ))}
          </div>
          <p className="text-sm font-medium text-gray-500">Based on {ratingData?.total_reviews || 0} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 flex flex-col items-center justify-center text-center">
          <BarChart3 size={32} className="text-gray-300 mb-3" />
          <h2 className="text-sm font-bold text-gray-900 mb-1">Rating Distribution</h2>
          <p className="text-xs text-gray-500">Distribution analytics are currently unavailable.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Reviews You've Written</h2>
          </div>

          {/* 3. STICKY FILTER TOOLBAR */}
          <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="bg-white p-2 rounded-2xl shadow-sm ring-1 ring-gray-200 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search businesses or campaigns..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full h-12 pl-11 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-gray-400 text-gray-900"
                  />
                </div>
                <div className="hidden md:flex items-center gap-2 pr-2">
                  <div className="h-8 w-px bg-gray-100 mx-2"></div>
                  <select className="h-10 pl-4 pr-10 text-sm font-medium text-gray-700 bg-gray-50 border-none rounded-xl focus:ring-0 cursor-pointer">
                    <option>Newest First</option>
                    <option>Highest Rating</option>
                    <option>Lowest Rating</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 pb-1">
                {["All", "5 Stars", "4 Stars", "Positive", "Needs Response"].map(status => (
                  <button 
                    key={status}
                    onClick={() => setStatusFilter(status.toLowerCase())}
                    className={`whitespace-nowrap px-4 h-8 rounded-full text-xs font-semibold tracking-wide transition-colors border ${
                      statusFilter === status.toLowerCase() 
                      ? 'bg-gray-900 text-white border-gray-900' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* REVIEWS LIST */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({length:3}).map((_,i) => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse ring-1 ring-gray-100"></div>)}
            </div>
          ) : !reviewsData || reviewsData.items.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4"><MessageSquare size={32}/></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No reviews written yet</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-6">You haven't reviewed any businesses yet. Complete a collaboration to leave a review.</p>
              <Link to="/promoter/collaborations" className="h-11 px-6 flex items-center justify-center rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm">
                View Collaborations
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewsData.items.map((review: any) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-primary-200 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-lg font-bold text-gray-700 ring-1 ring-gray-200">
                        {review.reviewer?.username?.charAt(0).toUpperCase() || 'B'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="text-base font-bold text-gray-900">{review.target?.full_name || 'Business Name'}</h3>
                          <BadgeCheck size={14} className="text-blue-500"/>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Reviewed on {new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100">
                      <Star size={14} className="fill-amber-400 text-amber-400"/>
                      <span className="text-sm font-bold text-amber-700">{review.rating}.0</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                      "{review.comment || 'No comment provided.'}"
                    </p>
                    {review.comment && review.comment.length > 150 && (
                      <button className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-2 hover:underline">Read More</button>
                    )}
                  </div>

                  {/* Collaboration Context */}
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
                      <Briefcase size={12}/> Campaign Name Placeholder
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
                      <Calendar size={12}/> {new Date(review.created_at).toLocaleDateString('en-US', {month:'short', year:'numeric'})}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => setEditingId(review.id)}
                      className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Edit size={14}/> Edit Review
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(review.id)}
                      className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-red-600 text-xs font-bold hover:bg-red-50 hover:border-red-200 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Trash2 size={14}/> Delete
                    </button>
                    <Link to="/promoter/collaborations" className="h-9 px-4 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors ml-auto flex items-center justify-center">
                      View Collaboration
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {reviewsData && reviewsData.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={16}/></button>
              <div className="flex items-center gap-1">
                {Array.from({length: reviewsData.pages}, (_,i) => i+1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold ${p === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={() => setPage(p => Math.min(reviewsData.pages, p+1))} disabled={page === reviewsData.pages} className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
          )}
        </div>

        {/* SIDEBAR COLUMN (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Recent Achievements */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl shadow-lg p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award size={120} />
            </div>
            <h2 className="text-sm font-bold text-indigo-200 mb-6 flex items-center gap-2 relative z-10">
              <Medal size={16}/> Creator Achievements
            </h2>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center ring-4 ring-amber-400/20"><Star size={20} className="fill-amber-900"/></div>
                <div>
                  <h3 className="text-sm font-bold text-white">Top Rated Creator</h3>
                  <p className="text-xs text-indigo-200 mt-0.5">Maintained 4.8+ for 6 months</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-400 text-emerald-900 flex items-center justify-center ring-4 ring-emerald-400/20"><Sparkles size={20} className="fill-emerald-900"/></div>
                <div>
                  <h3 className="text-sm font-bold text-white">Fast Responder</h3>
                  <p className="text-xs text-indigo-200 mt-0.5">Replies under 2 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reputation Badges */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Reputation Tags</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 flex items-center gap-1.5"><CheckCircle2 size={12}/> Excellent Communication</span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-1.5"><CheckCircle2 size={12}/> High Quality Content</span>
              <span className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100 flex items-center gap-1.5"><CheckCircle2 size={12}/> Meets Deadlines</span>
              <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100 flex items-center gap-1.5"><CheckCircle2 size={12}/> Highly Recommended</span>
            </div>
          </div>

        </div>
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
