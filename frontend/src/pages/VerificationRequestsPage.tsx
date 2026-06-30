import { useState } from "react";
import { useAdminVerificationRequests, useAdminApproveVerification, useAdminRejectVerification } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { Dialog } from "../components/ui/Dialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { Filter, CheckCircle, XCircle, FileText, Calendar, ShieldAlert } from "lucide-react";

export default function VerificationRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useAdminVerificationRequests({ page, limit: 20, status: statusFilter || undefined });
  const approve = useAdminApproveVerification();
  const reject = useAdminRejectVerification();

  const [approveConfirm, setApproveConfirm] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ requestId: string; notes: string } | null>(null);

  const confirmApprove = () => {
    if (!approveConfirm) return;
    approve.mutate({ requestId: approveConfirm }, {
      onSuccess: () => { notifySuccess("Verification approved"); setApproveConfirm(null); },
      onError: () => { notifyError("Failed to approve"); setApproveConfirm(null); },
    });
  };

  const confirmReject = () => {
    if (!rejectDialog) return;
    reject.mutate({ requestId: rejectDialog.requestId, admin_notes: rejectDialog.notes || undefined }, {
      onSuccess: () => { notifySuccess("Verification rejected"); setRejectDialog(null); },
      onError: () => { notifyError("Failed to reject"); setRejectDialog(null); },
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING": return { bg: "bg-amber-tag/10", text: "text-amber-tag", dot: "bg-amber-tag" };
      case "APPROVED": return { bg: "bg-emerald-status/10", text: "text-emerald-status", dot: "bg-emerald-status" };
      case "REJECTED": return { bg: "bg-coral-alert/10", text: "text-coral-alert", dot: "bg-coral-alert" };
      default: return { bg: "bg-slate-custom/10", text: "text-graphite", dot: "bg-graphite" };
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-midnight-ink">Verification Requests</h1>
          <p className="text-body text-ash mt-1">Review and process promoter KYC and identity verifications.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-64">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-fog" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full rounded-inputs border border-slate-custom/10 pl-10 pr-8 py-2.5 text-body text-graphite appearance-none focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No verification requests" description="There are currently no requests matching your criteria." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.items.map((req) => {
            const statusStyle = getStatusStyle(req.status);
            return (
              <div key={req.id} className="bg-white border border-slate-custom/10 border-t border-t-signal-blue rounded-cards shadow-product-card p-5 flex flex-col h-full hover:border-signal-blue/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-cards bg-sky-wash flex items-center justify-center text-signal-blue font-bold">
                      {req.promoter_username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-body font-bold text-graphite">{req.promoter_username}</h3>
                      <p className="text-caption text-ash flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        {new Date(req.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-badges ${statusStyle.bg} px-2 py-1 text-caption font-medium ${statusStyle.text} uppercase tracking-wide`}>
                    <span className={`w-1.5 h-1.5 rounded-pill ${statusStyle.dot}`}></span>
                    {req.status}
                  </span>
                </div>
                
                <div className="flex-1 bg-linen-canvas rounded-cards p-3 border border-slate-custom/10 mb-5">
                  <div className="flex items-center gap-2 mb-1.5 text-caption font-medium text-graphite uppercase tracking-wide">
                    <FileText size={14} className="text-ash" />
                    Applicant Details
                  </div>
                  {req.promoter_headline ? (
                    <p className="text-body text-ash">{req.promoter_headline}</p>
                  ) : (
                    <p className="text-body text-fog italic">No headline provided.</p>
                  )}
                  {req.admin_notes && (
                    <div className="mt-3 pt-3 border-t border-slate-custom/10">
                      <p className="text-caption font-medium text-graphite uppercase tracking-wide mb-1">Admin Notes</p>
                      <p className="text-body text-coral-alert">{req.admin_notes}</p>
                    </div>
                  )}
                </div>

                {req.status === "PENDING" && (
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-custom/10">
                    <button 
                      onClick={() => setApproveConfirm(req.id)} 
                      className="flex-1 flex items-center justify-center gap-2 rounded-buttons bg-emerald-status/10 border border-emerald-status/20 text-emerald-status px-3 py-2 text-body font-medium hover:bg-emerald-status/20 transition-colors"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => setRejectDialog({ requestId: req.id, notes: "" })} 
                      className="flex-1 flex items-center justify-center gap-2 rounded-buttons bg-coral-alert/10 border border-coral-alert/20 text-coral-alert px-3 py-2 text-body font-medium hover:bg-coral-alert/20 transition-colors"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="p-4 bg-white border border-slate-custom/10 rounded-cards flex items-center justify-between shadow-product-card">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-buttons border border-slate-custom/10 bg-white px-4 py-2 text-body font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Previous</button>
          <span className="text-caption text-ash uppercase tracking-wide">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-buttons border border-slate-custom/10 bg-white px-4 py-2 text-body font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Next</button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!approveConfirm}
        onClose={() => setApproveConfirm(null)}
        onConfirm={confirmApprove}
        title="Approve Verification"
        message="Are you sure you want to approve this verification request? This will mark the promoter as verified across the platform."
      />

      <Dialog
        isOpen={!!rejectDialog}
        onClose={() => setRejectDialog(null)}
        title="Reject Verification"
      >
        <div className="space-y-4">
          <div className="bg-coral-alert/10 border border-coral-alert/20 rounded-cards p-3">
            <p className="text-body text-coral-alert flex items-start gap-2">
              <ShieldAlert size={18} className="mt-0.5 shrink-0" />
              You are about to reject this verification request. Please provide a reason to help the promoter understand what they need to fix.
            </p>
          </div>
          <div>
            <label className="block text-caption font-medium uppercase tracking-wide text-graphite mb-2">Rejection Reason (Required)</label>
            <textarea
              value={rejectDialog?.notes ?? ""}
              onChange={(e) => setRejectDialog((prev) => prev ? { ...prev, notes: e.target.value } : null)}
              className="w-full rounded-inputs border border-slate-custom/10 p-3 text-body text-graphite focus:outline-none focus:border-coral-alert/50 focus:ring-1 focus:ring-coral-alert/50"
              rows={3}
              placeholder="e.g., Identity document is blurry..."
            />
          </div>
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-custom/10">
            <button onClick={() => setRejectDialog(null)} className="rounded-buttons border border-slate-custom/10 bg-white px-5 py-2.5 text-body font-medium text-graphite hover:bg-sky-wash transition-colors">Cancel</button>
            <button 
              onClick={confirmReject} 
              disabled={!rejectDialog?.notes?.trim()}
              className="rounded-buttons bg-coral-alert border border-coral-alert px-5 py-2.5 text-body font-medium text-white hover:bg-coral-alert/90 disabled:opacity-50 transition-colors"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
