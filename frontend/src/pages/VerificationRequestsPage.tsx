import { useState } from "react";
import { useAdminVerificationRequests, useAdminApproveVerification, useAdminRejectVerification } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function VerificationRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useAdminVerificationRequests({ page, limit: 20, status: statusFilter || undefined });
  const approve = useAdminApproveVerification();
  const reject = useAdminRejectVerification();

  if (isLoading) return <LoadingSpinner />;

  const handleApprove = (requestId: string) => {
    approve.mutate({ requestId }, {
      onSuccess: () => notifySuccess("Verification approved"),
      onError: () => notifyError("Failed to approve"),
    });
  };

  const handleReject = (requestId: string) => {
    const notes = prompt("Rejection reason (optional):");
    reject.mutate({ requestId, admin_notes: notes || undefined }, {
      onSuccess: () => notifySuccess("Verification rejected"),
      onError: () => notifyError("Failed to reject"),
    });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles[status] || ""}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Verification Requests</h1>

      <div className="flex gap-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded border px-3 py-2 text-sm">
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState title="No requests" description="No verification requests found." />
      ) : (
        <div className="space-y-4">
          {data.items.map((req) => (
            <div key={req.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text">{req.promoter_username}</h3>
                  {req.promoter_headline && <p className="text-sm text-gray-500">{req.promoter_headline}</p>}
                  <p className="mt-1 text-xs text-gray-400">Submitted {new Date(req.submitted_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {statusBadge(req.status)}
                </div>
              </div>
              {req.status === "PENDING" && (
                <div className="mt-3 flex space-x-3">
                  <button onClick={() => handleApprove(req.id)} className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
                    Approve
                  </button>
                  <button onClick={() => handleReject(req.id)} className="rounded border border-red-300 px-3 py-1 text-xs font-medium text-danger hover:bg-red-50">
                    Reject
                  </button>
                </div>
              )}
              {req.admin_notes && (
                <p className="mt-2 text-sm text-gray-600 italic">Note: {req.admin_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
