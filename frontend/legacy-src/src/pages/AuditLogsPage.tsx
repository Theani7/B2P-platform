import { useState } from "react";
import { useAdminAuditLogs } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { Search, Filter, History, User, MonitorSmartphone } from "lucide-react";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const { data, isLoading, error } = useAdminAuditLogs({
    page, limit: 20,
    search: search || undefined,
    action: actionFilter || undefined,
  });

  if (error) return <div className="text-center py-12"><p className="text-coral-alert font-medium">Error loading logs</p></div>;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-midnight-ink">Audit Logs</h1>
          <p className="text-body text-ash mt-1">Track administrative actions and system events.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-fog" />
          <input 
            type="text" 
            placeholder="Search logs by user, action, or entity..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            className="w-full rounded-inputs border border-slate-custom/10 pl-10 pr-4 py-2.5 text-body text-graphite focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50" 
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-fog" />
          <select 
            value={actionFilter} 
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} 
            className="w-full rounded-inputs border border-slate-custom/10 pl-10 pr-8 py-2.5 text-body text-graphite appearance-none focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50 bg-white"
          >
            <option value="">All Actions</option>
            <option value="USER_SUSPENDED">User Suspended</option>
            <option value="USER_ACTIVATED">User Activated</option>
            <option value="USER_DELETED">User Deleted</option>
            <option value="VERIFICATION_APPROVED">Verification Approved</option>
            <option value="VERIFICATION_REJECTED">Verification Rejected</option>
            <option value="CAMPAIGN_ARCHIVED">Campaign Archived</option>
            <option value="CAMPAIGN_CANCELLED">Campaign Cancelled</option>
            <option value="REVIEW_DELETED">Review Deleted</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No logs found" description="No audit logs match your search criteria." />
      ) : (
        <div className="bg-white border border-slate-custom/10 border-t border-t-signal-blue rounded-cards shadow-product-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-linen-canvas border-b border-slate-custom/10">
                <tr>
                  <th className="px-5 py-4 text-caption font-medium uppercase tracking-wide text-ash">Action Details</th>
                  <th className="px-5 py-4 text-caption font-medium uppercase tracking-wide text-ash">Admin</th>
                  <th className="px-5 py-4 text-caption font-medium uppercase tracking-wide text-ash">System Info</th>
                  <th className="px-5 py-4 text-caption font-medium uppercase tracking-wide text-ash text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-custom/10">
                {data.items.map((log) => (
                  <tr key={log.id} className="hover:bg-sky-wash/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit rounded-badges bg-sky-wash px-2 py-1 text-caption font-bold text-signal-blue uppercase tracking-wide">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        {log.entity_type && (
                          <span className="text-body text-ash">
                            Target: <span className="font-medium text-graphite">{log.entity_type}</span> {log.entity_id ? `(#${log.entity_id.slice(0, 8)})` : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-body font-medium text-graphite">
                        <User size={14} className="text-fog" />
                        {log.username || "System"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {log.ip_address ? (
                        <div className="flex items-center gap-2 text-body text-ash">
                          <MonitorSmartphone size={14} className="text-fog" />
                          {log.ip_address}
                        </div>
                      ) : (
                        <span className="text-body text-fog italic">No IP recorded</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="flex items-center gap-1.5 text-body font-medium text-graphite">
                          <History size={14} className="text-ash" />
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-caption text-ash uppercase tracking-wide">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.pages > 1 && (
            <div className="p-4 border-t border-slate-custom/10 bg-linen-canvas flex items-center justify-between">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-buttons border border-slate-custom/10 bg-white px-4 py-2 text-body font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Previous</button>
              <span className="text-caption text-ash uppercase tracking-wide">Page {data.page} of {data.pages}</span>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-buttons border border-slate-custom/10 bg-white px-4 py-2 text-body font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
