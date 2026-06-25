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
import { formatNepaliCurrency } from "../utils/currency";
import { PageHeader, Badge, Table } from "../components/ui";
import { type TableColumn } from "../components/ui/Table";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  ArrowRight,
  CalendarDays,
  TrendingUp,
  UserCheck,
} from "lucide-react";

const STATUS_BADGE_VARIANT: Record<string, string> = {
  ACTIVE: "verified",
  COMPLETED: "active",
  CANCELLED: "rejected",
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

  const bizQuery = useBusinessCollaborations({ page, limit: 20 }, isBusiness);
  const promQuery = usePromoterCollaborations({ page, limit: 20 }, !isBusiness);
  const { data, isLoading, error } = isBusiness ? bizQuery : promQuery;
  const completeCollab = useCompleteCollaboration();
  const createReview = useCreateReview();
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-xl bg-brand-coral-50 flex items-center justify-center mb-4">
        <XCircle size={32} className="text-brand-coral" />
      </div>
      <p className="text-xl font-medium text-gray-900">Error loading collaborations</p>
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

  const columns: TableColumn<any>[] = [
    {
      key: "campaign",
      header: "Campaign",
      render: (c: any) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 font-semibold">{c.campaign_title}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
              <TrendingUp size={10} className="text-brand-teal" />
              {c.campaign_category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
              {formatNepaliCurrency(c.campaign_budget)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "partner",
      header: "Partner",
      render: (c: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-teal-50 flex items-center justify-center flex-shrink-0 text-xs font-medium text-brand-teal-900">
            {c.partner_avatar_url ? (
              <img src={c.partner_avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              c.partner_name?.slice(0, 2).toUpperCase() || "??"
            )}
          </div>
          <span className="text-sm font-medium text-gray-900">{c.partner_name}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c: any) => {
        const StatusIcon = STATUS_ICONS[c.status] || Clock;
        const badgeVariant = STATUS_BADGE_VARIANT[c.status] || "draft";
        return (
          <Badge variant={badgeVariant as any}>
            <StatusIcon size={12} className="mr-1" />
            {STATUS_LABELS[c.status] || c.status}
          </Badge>
        );
      },
    },
    {
      key: "dates",
      header: "Dates",
      render: (c: any) => (
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={12} />
            Started: {new Date(c.started_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric"
            })}
          </span>
          {c.completed_at && (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-brand-teal" />
              Completed: {new Date(c.completed_at).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
              })}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (c: any) => (
        <div className="flex items-center gap-3">
          {c.status === "ACTIVE" && (
            <button
              onClick={() => handleComplete(c.id)}
              className="bg-brand-teal-50 text-brand-teal-900 border border-teal-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-teal-100 transition-colors inline-flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              Mark Complete
            </button>
          )}
          {c.status === "COMPLETED" && (
            <button
              onClick={() => setReviewingCollabId(c.id)}
              className="bg-brand-indigo text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
            >
              <Star size={14} />
              Write Review
            </button>
          )}
          {c.status === "ACTIVE" && (
            <Link
              to={isBusiness ? "/business/campaigns" : "/promoter/collaborations"}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-purple hover:underline ml-auto"
            >
              View Details <ArrowRight size={12} />
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Collaborations"
        description={
          isBusiness
            ? "Manage your partnerships with promoters"
            : "Track your collaborations with businesses"
        }
      />

      {/* Collaborations List */}
      <Table columns={columns} data={data.items} />

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <ArrowRight size={12} className="rotate-180" />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? "bg-brand-indigo text-white"
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Next
            <ArrowRight size={12} />
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
