import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { Role } from "../constants/roles";
import { useBusinessCollaborations, usePromoterCollaborations } from "../features/collaboration/api";
import { useCompleteCollaboration, useCreateReview } from "../features/reviews/api";
import ReviewFormDialog from "../components/reviews/ReviewFormDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  COMPLETED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function CollaborationsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [reviewingCollabId, setReviewingCollabId] = useState<string | null>(null);
  const isBusiness = user?.role === Role.BUSINESS;

  const bizQuery = useBusinessCollaborations({ page, limit: 20 });
  const promQuery = usePromoterCollaborations({ page, limit: 20 });
  const { data, isLoading, error } = isBusiness ? bizQuery : promQuery;
  const completeCollab = useCompleteCollaboration();
  const createReview = useCreateReview();
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null);

  if (error) return <div className="text-center py-12"><p className="text-danger">Error loading data</p><p className="text-gray-500 text-sm">{(error as Error).message}</p></div>;

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No collaborations yet"
        description={
          isBusiness
            ? "Accept promoter applications or send invitations to start collaborating."
            : "Apply to campaigns or accept invitations to start collaborating."
        }
      />
    );
  }

  const handleComplete = (collabId: string) => {
    setCompleteConfirm(collabId);
  };

  const confirmComplete = () => {
    if (!completeConfirm) return;
    completeCollab.mutate(completeConfirm, {
      onSuccess: () => { notifySuccess("Collaboration completed"); setCompleteConfirm(null); },
      onError: () => { notifyError("Failed to complete collaboration"); setCompleteConfirm(null); },
    });
  };

  const handleReviewSubmit = (data: { rating: number; comment?: string }) => {
    if (!reviewingCollabId) return;
    createReview.mutate({ collaborationId: reviewingCollabId, ...data }, {
      onSuccess: () => {
        notifySuccess("Review submitted");
        setReviewingCollabId(null);
      },
      onError: () => notifyError("Failed to submit review"),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Collaborations</h1>

      <div className="space-y-4">
        {data.items.map((c) => (
          <div key={c.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text">{c.campaign_title}</h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  <span>{c.campaign_category}</span>
                  <span>&middot;</span>
                  <span>${c.campaign_budget?.toLocaleString()}</span>
                  <span>&middot;</span>
                  <span>Partner: {c.partner_name}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`rounded px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status] ?? ""}`}
                >
                  {c.status}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
              <span>Started {new Date(c.started_at).toLocaleDateString()}</span>
              {c.completed_at && (
                <span>Completed {new Date(c.completed_at).toLocaleDateString()}</span>
              )}
            </div>
            {c.status === "ACTIVE" && (
              <div className="mt-3">
                <button
                  onClick={() => handleComplete(c.id)}
                  aria-label={`Mark collaboration ${c.campaign_title} complete`}
                  className="rounded border border-purple-300 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50"
                >
                  Mark Complete
                </button>
              </div>
            )}
            {c.status === "COMPLETED" && (
              <div className="mt-3">
                <button
                  onClick={() => setReviewingCollabId(c.id)}
                  aria-label={`Write review for ${c.campaign_title}`}
                  className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90"
                >
                  Write Review
                </button>
              </div>
            )}
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

      {reviewingCollabId && (
        <ReviewFormDialog
          open={!!reviewingCollabId}
          onClose={() => setReviewingCollabId(null)}
          onSubmit={handleReviewSubmit}
          title="Review Partner"
        />
      )}

      <ConfirmDialog
        isOpen={!!completeConfirm}
        onClose={() => setCompleteConfirm(null)}
        onConfirm={confirmComplete}
        title="Mark Complete"
        message="Are you sure you want to mark this collaboration as complete?"
      />
    </div>
  );
}
