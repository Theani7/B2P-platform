import { useState } from "react";
import { useAdminVerificationRequests, useAdminApproveVerification, useAdminRejectVerification } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { Dialog } from "../components/ui/Dialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function VerificationRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useAdminVerificationRequests({ page, limit: 20, status: statusFilter || undefined });
  const approve = useAdminApproveVerification();
  const reject = useAdminRejectVerification();

  const [approveConfirm, setApproveConfirm] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ requestId: string; notes: string } | null>(null);

  if (isLoading) return <LoadingSpinner />;

  const handleApprove = (requestId: string) => {
    setApproveConfirm(requestId);
  };

  const confirmApprove = () => {
    if (!approveConfirm) return;
    approve.mutate({ requestId: approveConfirm }, {
      onSuccess: () => { notifySuccess("Verification approved"); setApproveConfirm(null); },
      onError: () => { notifyError("Failed to approve"); setApproveConfirm(null); },
    });
  };

  const handleReject = (requestId: string) => {
    setRejectDialog({ requestId, notes: "" });
  };

  const confirmReject = () => {
    if (!rejectDialog) return;
    reject.mutate({ requestId: rejectDialog.requestId, admin_notes: rejectDialog.notes || undefined }, {
      onSuccess: () => { notifySuccess("Verification rejected"); setRejectDialog(null); },
      onError: () => { notifyError("Failed to reject"); setRejectDialog(null); },
    });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-brand-amber-50 text-brand-amber-900",
      APPROVED: "bg-brand-teal-50 text-brand-teal-900",
      REJECTED: "bg-brand-coral-50 text-brand-coral-900",
    };
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || ""}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-stone-900 font-stretch-condensed">Verification Requests</h1>

      <div className="flex gap-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-stone-100 px-3 py-2 text-sm text-stone-900">
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
            <div key={req.id} className="rounded-xl border border-stone-100 bg-white p-5 border-t-[1px] border-t-brand-purple">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-stone-900">{req.promoter_username}</h3>
                  {req.promoter_headline && <p className="text-sm text-stone-500 mt-1">{req.promoter_headline}</p>}
                  <p className="mt-2 text-xs text-stone-400">Submitted {new Date(req.submitted_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {statusBadge(req.status)}
                </div>
              </div>
              {req.status === "PENDING" && (
                <div className="mt-4 flex space-x-3">
                  <button onClick={() => handleApprove(req.id)} className="rounded-lg bg-brand-teal-50 border border-brand-teal text-brand-teal-900 px-3 py-1.5 text-xs font-medium hover:bg-brand-teal-100 transition-colors">
                    Approve
                  </button>
                  <button onClick={() => handleReject(req.id)} className="rounded-lg bg-brand-coral-50 border border-brand-coral text-brand-coral-900 px-3 py-1.5 text-xs font-medium hover:bg-brand-coral-100 transition-colors">
                    Reject
                  </button>
                </div>
              )}
              {req.admin_notes && (
                <p className="mt-3 text-sm text-stone-600 italic">Note: {req.admin_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-stone-100 bg-white px-3 py-1.5 text-sm text-stone-900 hover:bg-stone-50 disabled:opacity-50 transition-colors">Previous</button>
          <span className="text-sm text-stone-500">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-lg border border-stone-100 bg-white px-3 py-1.5 text-sm text-stone-900 hover:bg-stone-50 disabled:opacity-50 transition-colors">Next</button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!approveConfirm}
        onClose={() => setApproveConfirm(null)}
        onConfirm={confirmApprove}
        title="Approve Verification"
        message="Approve this verification request?"
      />

      <Dialog
        isOpen={!!rejectDialog}
        onClose={() => setRejectDialog(null)}
        title="Reject Verification"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">Enter a reason for rejection (optional):</p>
          <textarea
            value={rejectDialog?.notes ?? ""}
            onChange={(e) => setRejectDialog((prev) => prev ? { ...prev, notes: e.target.value } : null)}
            className="w-full rounded-lg border border-stone-100 p-3 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-purple"
            rows={3}
            aria-label="Rejection notes"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setRejectDialog(null)} className="rounded-lg border border-stone-100 bg-white px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50">Cancel</button>
            <button onClick={confirmReject} className="rounded-lg bg-brand-coral-50 border border-brand-coral px-4 py-2 text-sm font-medium text-brand-coral-900 hover:bg-brand-coral-100">Reject</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
