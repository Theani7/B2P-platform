import { useState } from "react";
import { usePromoterApplications, useWithdrawApplication } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { formatNepaliCurrency } from "../utils/currency";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-500",
};

export default function MyApplicationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = usePromoterApplications({ page, limit: 20 });
  const withdrawMutation = useWithdrawApplication();
  const [withdrawConfirm, setWithdrawConfirm] = useState<string | null>(null);

  if (error) return <div className="text-center py-12"><p className="text-danger">Error loading data</p><p className="text-gray-500 text-sm">{(error as Error).message}</p></div>;

  const handleWithdraw = (id: string) => {
    setWithdrawConfirm(id);
  };

  const confirmWithdraw = () => {
    if (!withdrawConfirm) return;
    withdrawMutation.mutate(withdrawConfirm, {
      onSuccess: () => { notifySuccess("Application withdrawn"); setWithdrawConfirm(null); },
      onError: (e) => { notifyError(e.message); setWithdrawConfirm(null); },
    });
  };

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No applications yet"
        description="Browse the campaign marketplace to find opportunities."
      />
    );
  }

  const items = data.items as any[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">My Applications</h1>

      <div className="space-y-4">
        {items.map((app: any) => (
          <div key={app.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text">{app.campaign_title}</h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  <span>{app.campaign_category}</span>
                  <span>&middot;</span>
                  <span>{formatNepaliCurrency(app.campaign_budget)}</span>
                  <span>&middot;</span>
                  <span>{app.campaign_location}</span>
                </div>
              </div>
              <span
                className={`rounded px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[app.status] ?? ""}`}
              >
                {app.status}
              </span>
            </div>
            {app.message && (
              <p className="mt-2 text-sm text-gray-600">{app.message}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
              <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
              {app.status === "PENDING" && (
                <button
                  onClick={() => handleWithdraw(app.id)}
                  disabled={withdrawMutation.isPending}
                  aria-label="Withdraw application"
                  className="text-danger hover:underline"
                >
                  Withdraw
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
        isOpen={!!withdrawConfirm}
        onClose={() => setWithdrawConfirm(null)}
        onConfirm={confirmWithdraw}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application?"
      />
    </div>
  );
}
