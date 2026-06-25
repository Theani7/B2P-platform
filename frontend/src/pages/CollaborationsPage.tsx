import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { Role } from "../constants/roles";
import { useBusinessCollaborations, usePromoterCollaborations } from "../features/collaboration/api";
import { useCompleteCollaboration, useCreateReview } from "../features/reviews/api";
import ReviewFormDialog from "../components/reviews/ReviewFormDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import {
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Star,
  ArrowRight,
  CalendarDays,
  TrendingUp,
  UserCheck,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-brand-teal-50 text-brand-teal-900 ring-brand-teal/20",
  COMPLETED: "bg-brand-purple-50 text-brand-purple-900 ring-brand-purple/20",
  CANCELLED: "bg-brand-coral-50 text-brand-coral-900 ring-brand-coral/20",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  ACTIVE: Clock,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
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

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-brand-coral-50 flex items-center justify-center mb-4 ring-1 ring-brand-coral/10">
        <XCircle size={32} className="text-brand-coral" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading collaborations</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
    </div>
  );

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
      onSuccess: () => { notifySuccess("Collaboration marked as complete!"); setCompleteConfirm(null); },
      onError: () => { notifyError("Failed to complete collaboration"); setCompleteConfirm(null); },
    });
  };

  const handleReviewSubmit = (data: { rating: number; comment?: string }) => {
    if (!reviewingCollabId) return;
    createReview.mutate({ collaborationId: reviewingCollabId, ...data }, {
      onSuccess: () => {
        notifySuccess("Review submitted successfully!");
        setReviewingCollabId(null);
      },
      onError: () => notifyError("Failed to submit review"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-brand-teal p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <Handshake size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-white">Collaborations</h1>
            <p className="text-sm text-white/70 mt-0.5">
              {isBusiness
                ? "Manage your partnerships with promoters"
                : "Track your collaborations with businesses"}
            </p>
          </div>
        </div>
      </div>

      {/* Collaborations List */}
      <div className="space-y-4">
        {data.items.map((c) => {
          const StatusIcon = STATUS_ICONS[c.status] || Clock;
          return (
            <div
              key={c.id}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Partner Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-brand-teal-50 flex items-center justify-center flex-shrink-0 ring-1 ring-brand-teal/10 text-lg font-bold text-brand-teal-900">
                      {c.partner_avatar_url ? (
                        <img src={c.partner_avatar_url} alt="" className="h-full w-full rounded-2xl object-cover" />
                      ) : (
                        c.partner_name?.slice(0, 2).toUpperCase() || "??"
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-medium text-gray-900 truncate">{c.campaign_title}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg ring-1 ring-gray-100">
                          <TrendingUp size={11} className="text-brand-teal" />
                          {c.campaign_category}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <DollarSign size={12} className="text-brand-teal" />
                          ${c.campaign_budget?.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <UserCheck size={12} className="text-gray-400" />
                          Partner: {c.partner_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium ring-1 flex-shrink-0 ${STATUS_STYLES[c.status] ?? ""}`}>
                    <StatusIcon size={12} />
                    {STATUS_LABELS[c.status] || c.status}
                  </span>
                </div>

                {/* Dates */}
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    Started {new Date(c.started_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </span>
                  {c.completed_at && (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-brand-teal" />
                      Completed {new Date(c.completed_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-3">
                  {c.status === "ACTIVE" && (
                    <button
                      onClick={() => handleComplete(c.id)}
                      className="inline-flex items-center gap-2 bg-brand-teal text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <CheckCircle2 size={16} />
                      Mark Complete
                    </button>
                  )}
                  {c.status === "COMPLETED" && (
                    <button
                      onClick={() => setReviewingCollabId(c.id)}
                      className="inline-flex items-center gap-2 bg-brand-purple text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <Star size={16} />
                      Write Review
                    </button>
                  )}
                  {c.status === "ACTIVE" && (
                    <Link
                      to={isBusiness ? "/business/campaigns" : "/promoter/collaborations"}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:text-brand-purple-900 ml-auto transition-colors"
                    >
                      View Details <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowRight size={14} className="rotate-180" />
            Previous
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  p === page
                    ? "bg-brand-purple text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page >= data.pages}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ArrowRight size={14} />
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
        message="Are you sure you want to mark this collaboration as complete? This will notify your partner."
      />
    </div>
  );
}
