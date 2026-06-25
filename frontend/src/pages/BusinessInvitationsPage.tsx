import { useState } from "react";
import { useBusinessInvitations, useCancelInvitation } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};

export default function BusinessInvitationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useBusinessInvitations({ page, limit: 20 });
  const cancelMutation = useCancelInvitation();
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  if (error) return <div className="text-center py-12"><p className="text-danger">Error loading data</p><p className="text-gray-500 text-sm">{(error as Error).message}</p></div>;

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
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Sent Invitations</h1>

      <div className="space-y-4">
        {data.items.map((inv) => (
          <div key={inv.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text">{inv.campaign_title}</h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  <span>{inv.campaign_category}</span>
                  <span>&middot;</span>
                  <span>${inv.campaign_budget?.toLocaleString()}</span>
                  <span>&middot;</span>
                  <span>{inv.campaign_location}</span>
                  <span>&middot;</span>
                  <span>To: {inv.business_name}</span>
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
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
              <span>Sent {new Date(inv.created_at).toLocaleDateString()}</span>
              {inv.status === "PENDING" && (
                <button
                  onClick={() => handleCancel(inv.id)}
                  disabled={cancelMutation.isPending}
                  className="text-danger hover:underline"
                >
                  Cancel
                </button>
              )}
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
        isOpen={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        onConfirm={confirmCancel}
        title="Cancel Invitation"
        message="Are you sure you want to cancel this invitation?"
      />
    </div>
  );
}
