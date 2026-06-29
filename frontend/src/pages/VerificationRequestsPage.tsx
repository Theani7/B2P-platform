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
      PENDING: "bg-amber-tag/10 text-amber-tag",
      APPROVED: "bg-emerald-status/10 text-emerald-status",
      REJECTED: "bg-coral-alert/10 text-coral-alert",
    };
    return <span className={`rounded-badges px-1.5 py-0.5 text-xs font-medium ${styles[status] || ""}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-heading text-graphite">Verification Requests</h1>

      <div className="flex gap-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-inputs border border-slate-custom/10 px-3 py-2 text-sm text-graphite">
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
            <div key={req.id} className="rounded-cards border border-slate-custom/10 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-graphite">{req.promoter_username}</h3>
                  {req.promoter_headline && <p className="text-sm text-ash mt-1">{req.promoter_headline}</p>}
                  <p className="mt-2 text-xs text-fog">Submitted {new Date(req.submitted_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {statusBadge(req.status)}
                </div>
              </div>
              {req.status === "PENDING" && (
                <div className="mt-4 flex space-x-3">
                  <button onClick={() => handleApprove(req.id)} className="rounded-inputs bg-emerald-status/10 border border-emerald-status text-emerald-status px-3 py-1.5 text-xs font-medium hover:bg-emerald-status/20 transition-colors">
                    Approve
                  </button>
                  <button onClick={() => handleReject(req.id)} className="rounded-inputs bg-coral-alert/10 border border-coral-alert text-coral-alert px-3 py-1.5 text-xs font-medium hover:bg-coral-alert/20 transition-colors">
                    Reject
                  </button>
                </div>
              )}
              {req.admin_notes && (
                <p className="mt-3 text-sm text-graphite italic">Note: {req.admin_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-inputs border border-slate-custom/10 bg-white px-3 py-1.5 text-sm text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Previous</button>
          <span className="text-sm text-ash">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-inputs border border-slate-custom/10 bg-white px-3 py-1.5 text-sm text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Next</button>
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
          <p className="text-sm text-ash">Enter a reason for rejection (optional):</p>
          <textarea
            value={rejectDialog?.notes ?? ""}
            onChange={(e) => setRejectDialog((prev) => prev ? { ...prev, notes: e.target.value } : null)}
            className="w-full rounded-inputs border border-slate-custom/10 p-3 text-sm text-graphite focus:outline-none focus:ring-signal-blue/10"
            rows={3}
            aria-label="Rejection notes"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setRejectDialog(null)} className="rounded-inputs border border-slate-custom/10 bg-white px-4 py-2 text-sm font-medium text-graphite hover:bg-sky-wash">Cancel</button>
            <button onClick={confirmReject} className="rounded-inputs bg-coral-alert/10 border border-coral-alert px-4 py-2 text-sm font-medium text-coral-alert hover:bg-coral-alert/20">Reject</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
