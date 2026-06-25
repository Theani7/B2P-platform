import { Link } from "react-router-dom";
import { useState } from "react";
import { useBusinessInvitations, useCancelInvitation } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import {
  Send,
  XCircle,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  DollarSign,
  CalendarDays,
  MessageSquare,
  Ban,
  ArrowRight,
  UserPlus,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-brand-amber-50 text-brand-amber-900 ring-brand-amber/20",
  ACCEPTED: "bg-brand-teal-50 text-brand-teal-900 ring-brand-teal/20",
  REJECTED: "bg-brand-coral-50 text-brand-coral-900 ring-brand-coral/20",
  EXPIRED: "bg-gray-100 text-gray-500 ring-gray-200",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  ACCEPTED: CheckCircle2,
  REJECTED: XCircle,
  EXPIRED: XCircle,
};

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
          <div className="flex items-center gap-2 mt-2">
            <UserPlus size={20} className="text-brand-purple" />
            <span className="text-sm text-gray-500">Browse promoter directory to send invites</span>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-purple via-brand-indigo to-brand-purple-900 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shadow-lg ring-1 ring-white/20">
            <Mail size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-white">Sent Invitations</h1>
            <p className="text-sm text-white/70 mt-0.5">Track and manage your promoter invitations</p>
          </div>
        </div>
      </div>

      {/* Invitations List */}
      <div className="space-y-4">
        {data.items.map((inv) => {
          const StatusIcon = STATUS_ICONS[inv.status] || Clock;
          return (
            <div
              key={inv.id}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Campaign Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple-50 to-brand-indigo-50 flex items-center justify-center flex-shrink-0 ring-1 ring-brand-purple/10">
                      <Send size={20} className="text-brand-purple" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-medium text-gray-900 truncate">{inv.campaign_title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg ring-1 ring-gray-100">
                          <Mail size={11} className="text-brand-purple" />
                          {inv.campaign_category}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <DollarSign size={12} className="text-brand-teal" />
                          ${inv.campaign_budget?.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin size={12} className="text-gray-400" />
                          {inv.campaign_location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium ring-1 flex-shrink-0 ${STATUS_STYLES[inv.status] ?? ""}`}>
                    <StatusIcon size={12} />
                    {STATUS_LABELS[inv.status] || inv.status}
                  </span>
                </div>

                {/* Message */}
                {inv.message && (
                  <div className="mt-4 flex gap-3 p-4 bg-gray-50 rounded-xl ring-1 ring-gray-100">
                    <MessageSquare size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{inv.message}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
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
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-coral hover:text-brand-coral-900 bg-brand-coral-50 px-3 py-1.5 rounded-lg hover:bg-brand-coral-100 transition-colors"
                    >
                      <Ban size={12} />
                      {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                  {inv.status === "ACCEPTED" && (
                    <Link
                      to="/business/collaborations"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-teal hover:text-brand-teal-900 transition-colors"
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
