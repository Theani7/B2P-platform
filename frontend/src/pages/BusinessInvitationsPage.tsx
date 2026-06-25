import { Link } from "react-router-dom";
import { useState } from "react";
import { useBusinessInvitations, useCancelInvitation } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader, Badge } from "../components/ui";
import {
  Send,
  XCircle,
  Mail,
  MapPin,
  DollarSign,
  CalendarDays,
  MessageSquare,
  ArrowRight,
  UserPlus,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting Response",
  ACCEPTED: "Accepted",
  REJECTED: "Declined",
  EXPIRED: "Expired",
};

export default function BusinessInvitationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useBusinessInvitations({ page, limit: 20 });
  const cancelMutation = useCancelInvitation();
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-brand-coral-50 flex items-center justify-center mb-4 ring-1 ring-brand-coral/10">
        <XCircle size={32} className="text-brand-coral" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading invitations</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
    </div>
  );

  const handleCancel = (id: string) => {
    setCancelConfirm(id);
  };

  const confirmCancel = () => {
    if (!cancelConfirm) return;
    cancelMutation.mutate(cancelConfirm, {
      onSuccess: () => { notifySuccess("Invitation cancelled"); setCancelConfirm(null); },
      onError: (e) => { notifyError(e.message); setCancelConfirm(null); },
    });
  };

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No invitations sent"
        description="Invite promoters from their public profiles to collaborate on your campaigns."
        action={
          <Link
            to="/business/promoters"
            className="inline-flex items-center gap-2 bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <UserPlus size={16} />
            Browse Promoter Directory
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Sent Invitations"
        description="Track and manage your promoter invitations"
      />

      {/* Invitations List */}
      <div className="space-y-4">
        {data.items.map((inv) => {
          const badgeVariant =
            inv.status === "PENDING"
              ? "pending"
              : inv.status === "ACCEPTED"
              ? "verified"
              : inv.status === "REJECTED"
              ? "rejected"
              : "draft";

          return (
            <div
              key={inv.id}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors duration-150"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Campaign Icon */}
                    <div className="w-10 h-10 rounded-lg bg-brand-purple-50 flex items-center justify-center flex-shrink-0 text-brand-purple-900">
                      <Send size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{inv.campaign_title}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                          <Mail size={10} className="text-brand-purple" />
                          {inv.campaign_category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <DollarSign size={10} className="text-brand-teal" />
                          ${inv.campaign_budget?.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={10} className="text-gray-400" />
                          {inv.campaign_location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge variant={badgeVariant}>
                    {STATUS_LABELS[inv.status] || inv.status}
                  </Badge>
                </div>

                {/* Message */}
                {inv.message && (
                  <div className="mt-3.5 flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <MessageSquare size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">{inv.message}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-normal">
                    <CalendarDays size={12} />
                    Sent {new Date(inv.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {inv.status === "PENDING" && (
                    <button
                      onClick={() => handleCancel(inv.id)}
                      disabled={cancelMutation.isPending}
                      className="bg-brand-coral-50 text-brand-coral-900 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {inv.status === "ACCEPTED" && (
                    <Link
                      to="/business/collaborations"
                      className="text-xs text-brand-purple hover:underline flex items-center gap-1 font-medium"
                    >
                      View Collaboration <ArrowRight size={12} />
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

      <ConfirmDialog
        isOpen={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        onConfirm={confirmCancel}
        title="Cancel Invitation"
        message="Are you sure you want to cancel this invitation? The promoter will be notified."
      />
    </div>
  );
}
