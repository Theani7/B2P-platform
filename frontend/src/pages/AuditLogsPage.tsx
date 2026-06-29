import { useState } from "react";
import { useAdminAuditLogs } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const { data, isLoading } = useAdminAuditLogs({
    page, limit: 20,
    search: search || undefined,
    action: actionFilter || undefined,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-stone-900 font-stretch-condensed">Audit Logs</h1>

      <div className="flex flex-wrap gap-4">
        <input type="text" placeholder="Search logs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="rounded-lg border border-stone-100 px-3 py-2 text-sm flex-1 min-w-[200px] text-stone-900" />
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="rounded-lg border border-stone-100 px-3 py-2 text-sm text-stone-900">
          <option value="">All Actions</option>
          <option value="USER_SUSPENDED">User Suspended</option>
          <option value="USER_ACTIVATED">User Activated</option>
          <option value="USER_DELETED">User Deleted</option>
          <option value="VERIFICATION_APPROVED">Verification Approved</option>
          <option value="VERIFICATION_REJECTED">Verification Rejected</option>
          <option value="VERIFICATION_REVOKED">Verification Revoked</option>
          <option value="CAMPAIGN_ARCHIVED">Campaign Archived</option>
          <option value="CAMPAIGN_CANCELLED">Campaign Cancelled</option>
          <option value="REVIEW_DELETED">Review Deleted</option>
        </select>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState title="No logs" description="No audit logs found." />
      ) : (
        <div className="space-y-3">
          {data.items.map((log) => (
            <div key={log.id} className="rounded-xl border border-stone-100 bg-white p-5 border-t-[1px] border-t-brand-purple">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-900">{log.action}</span>
                    {log.username && <span className="text-sm text-stone-500">by {log.username}</span>}
                  </div>
                  <div className="mt-2 text-sm text-stone-500">
                    {log.entity_type && <span>{log.entity_type}{log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ""}</span>}
                  </div>
                </div>
                <div className="text-right text-xs text-stone-400">
                  <p>{new Date(log.created_at).toLocaleDateString()}</p>
                  <p>{new Date(log.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
              {log.ip_address && (
                <p className="mt-2 text-xs text-stone-400">IP: {log.ip_address}</p>
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
    </div>
  );
}
