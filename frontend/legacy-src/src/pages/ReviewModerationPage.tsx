import { useState } from "react";
import { useAdminReviews, useAdminDeleteReview } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import RatingStars from "../components/reviews/RatingStars";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { Search, Trash2, Calendar, MessageSquare, ArrowRight } from "lucide-react";

export default function ReviewModerationPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useAdminReviews({ page, limit: 20, search: search || undefined });
  const deleteReview = useAdminDeleteReview();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (error) return <div className="text-center py-12"><p className="text-coral-alert font-medium">Error loading reviews</p></div>;

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteReview.mutate(confirmDelete, {
      onSuccess: () => { notifySuccess("Review deleted successfully"); setConfirmDelete(null); },
      onError: () => { notifyError("Failed to delete review"); setConfirmDelete(null); },
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-midnight-ink">Review Moderation</h1>
          <p className="text-body text-ash mt-1">Monitor platform feedback and remove abusive reviews.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-4">
        <div className="relative max-w-xl">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-fog" />
          <input 
            type="text" 
            placeholder="Search reviews by content or username..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            className="w-full rounded-inputs border border-slate-custom/10 pl-10 pr-4 py-2.5 text-body text-graphite focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50" 
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No reviews found" description="Try adjusting your search criteria." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.items.map((r) => (
            <div key={r.id} className="bg-white border border-slate-custom/10 border-t border-t-signal-blue rounded-cards shadow-product-card p-5 flex flex-col h-full hover:border-signal-blue/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <RatingStars rating={r.rating} size="md" />
                  <span className="text-heading-sm font-bold text-graphite ml-1">{r.rating}</span>
                </div>
                <button 
                  onClick={() => setConfirmDelete(r.id)} 
                  className="p-2 -mr-2 -mt-2 rounded-cards text-coral-alert hover:bg-coral-alert/10 transition-colors"
                  title="Delete Review"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex-1">
                {r.comment ? (
                  <div className="relative">
                    <MessageSquare size={16} className="absolute top-0.5 left-0 text-sky-wash" />
                    <p className="text-body text-graphite italic pl-6">&quot;{r.comment}&quot;</p>
                  </div>
                ) : (
                  <p className="text-body text-fog italic">No comment provided.</p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-custom/10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-body">
                    <span className="text-graphite font-medium">{r.reviewer_username}</span>
                    <ArrowRight size={14} className="text-ash" />
                    <span className="text-signal-blue font-medium">{r.reviewee_username}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-caption text-ash uppercase tracking-wide mt-1">
                    <Calendar size={12} />
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="p-4 bg-white border border-slate-custom/10 rounded-cards flex items-center justify-between shadow-product-card">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-buttons border border-slate-custom/10 bg-white px-4 py-2 text-body font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Previous</button>
          <span className="text-caption text-ash uppercase tracking-wide">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-buttons border border-slate-custom/10 bg-white px-4 py-2 text-body font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Next</button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This action cannot be undone."
      />
    </div>
  );
}
