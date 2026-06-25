import { useState } from "react";
import { usePromoterInvitations, useAcceptInvitation, useRejectInvitation } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};

export default function PromoterInvitationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = usePromoterInvitations({ page, limit: 20 });
  const acceptMutation = useAcceptInvitation();
  const rejectMutation = useRejectInvitation();
  const [actionConfirm, setActionConfirm] = useState<{ id: string; action: "accept" | "reject" } | null>(null);

  if (error) return <div className="text-center py-12"><p className="text-danger">Error loading data</p><p className="text-gray-500 text-sm">{(error as Error).message}</p></div>;

  const handleAccept = (id: string) => {
    setActionConfirm({ id, action: "accept" });
  };

  const handleReject = (id: string) => {
    setActionConfirm({ id, action: "reject" });
  };

  const confirmAction = () => {
    if (!actionConfirm) return;
    if (actionConfirm.action === "accept") {
      acceptMutation.mutate(actionConfirm.id, {
        onSuccess: () => { notifySuccess("Invitation accepted, collaboration started"); setActionConfirm(null); },
        onError: (e) => { notifyError(e.message); setActionConfirm(null); },
      });
    } else {
      rejectMutation.mutate(actionConfirm.id, {
        onSuccess: () => { notifySuccess("Invitation rejected"); setActionConfirm(null); },
        onError: (e) => { notifyError(e.message); setActionConfirm(null); },
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No invitations yet"
        description="Businesses will invite you to collaborate on their campaigns."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">My Invitations</h1>

      <div className="space-y-4">
        {data.items.map((inv) => (
          <div key={inv.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text">{inv.campaign_title}</h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  <span>by {inv.business_name}</span>
                  <span>&middot;</span>
                  <span>{inv.campaign_category}</span>
                  <span>&middot;</span>
                  <span>${inv.campaign_budget?.toLocaleString()}</span>
                  <span>&middot;</span>
                  <span>{inv.campaign_location}</span>
                </div>
              </div>
              <span
                className={`rounded px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[inv.status] ?? ""}`}
              >
                {inv.status}
              </span>
            </div>
            {inv.message && (
              <p className="mt-2 text-sm text-gray-600">{inv.message}</p>
            )}
            {inv.status === "PENDING" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAccept(inv.id)}
                  disabled={acceptMutation.isPending}
                  aria-label={`Accept invitation from ${inv.business_name}`}
                  className="rounded bg-success px-4 py-1.5 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(inv.id)}
                  disabled={rejectMutation.isPending}
                  aria-label={`Reject invitation from ${inv.business_name}`}
                  className="rounded border border-danger px-4 py-1.5 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-400">
              Received {new Date(inv.created_at).toLocaleDateString()}
            </div>
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

      <ConfirmDialog
        isOpen={!!actionConfirm}
        onClose={() => setActionConfirm(null)}
        onConfirm={confirmAction}
        title={actionConfirm?.action === "accept" ? "Accept Invitation" : "Reject Invitation"}
        message={actionConfirm?.action === "accept" ? "Accept this invitation and start collaborating?" : "Reject this invitation?"}
      />
    </div>
  );
}
