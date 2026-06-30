import { useState } from "react";
import { useAdminCampaigns, useAdminArchiveCampaign, useAdminCancelCampaign } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { formatNepaliCurrency } from "../utils/currency";
import { Search, Filter, ArchiveX, Ban, Calendar, Target, MapPin } from "lucide-react";

export default function CampaignModerationPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading, error } = useAdminCampaigns({ page, limit: 20, search: search || undefined, status: statusFilter || undefined });
  const archiveCamp = useAdminArchiveCampaign();
  const cancelCamp = useAdminCancelCampaign();

  const [confirmArchive, setConfirmArchive] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  if (error) return <div className="text-center py-12"><p className="text-coral-alert font-medium">Error loading data</p></div>;

  const handleArchive = () => {
    if (!confirmArchive) return;
    archiveCamp.mutate(confirmArchive, { 
      onSuccess: () => { notifySuccess("Campaign archived"); setConfirmArchive(null); }, 
      onError: () => { notifyError("Failed to archive"); setConfirmArchive(null); }
    });
  };

  const handleCancel = () => {
    if (!confirmCancel) return;
    cancelCamp.mutate(confirmCancel, { 
      onSuccess: () => { notifySuccess("Campaign cancelled"); setConfirmCancel(null); }, 
      onError: () => { notifyError("Failed to cancel"); setConfirmCancel(null); }
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "DRAFT": return { bg: "bg-slate-custom/10", text: "text-graphite", dot: "bg-graphite" };
      case "OPEN": return { bg: "bg-emerald-status/10", text: "text-emerald-status", dot: "bg-emerald-status" };
      case "ACTIVE": return { bg: "bg-signal-blue/10", text: "text-signal-blue", dot: "bg-signal-blue" };
      case "COMPLETED": return { bg: "bg-sky-wash", text: "text-graphite", dot: "bg-graphite" };
      case "ARCHIVED": return { bg: "bg-amber-tag/10", text: "text-amber-tag", dot: "bg-amber-tag" };
      case "CANCELLED": return { bg: "bg-coral-alert/10", text: "text-coral-alert", dot: "bg-coral-alert" };
      default: return { bg: "bg-slate-custom/10", text: "text-graphite", dot: "bg-graphite" };
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-midnight-ink">Campaign Moderation</h1>
          <p className="text-body text-ash mt-1">Monitor, archive, and cancel live platform campaigns.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-fog" />
          <input 
            type="text" 
            placeholder="Search campaigns by title, business, or niche..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            className="w-full rounded-inputs border border-slate-custom/10 pl-10 pr-4 py-2.5 text-body text-graphite focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50" 
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-fog" />
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} 
            className="w-full rounded-inputs border border-slate-custom/10 pl-10 pr-8 py-2.5 text-body text-graphite appearance-none focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="OPEN">Open</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No campaigns found" description="Try adjusting your search filters." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {data.items.map((c) => {
            const statusStyle = getStatusStyle(c.status);
            return (
              <div key={c.id} className="bg-white border border-slate-custom/10 border-t border-t-signal-blue rounded-cards shadow-product-card p-5 hover:border-signal-blue/30 transition-all flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-heading-sm font-medium text-graphite">{c.title}</h3>
                    <p className="text-body text-signal-blue font-medium mt-0.5">{c.business_company_name}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-badges ${statusStyle.bg} px-2 py-1 text-caption font-medium ${statusStyle.text} uppercase tracking-wide shrink-0`}>
                    <span className={`w-1.5 h-1.5 rounded-pill ${statusStyle.dot}`}></span>
                    {c.status}
                  </span>
                </div>
                
                <div className="flex-1 bg-linen-canvas rounded-cards p-4 border border-slate-custom/10 mb-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-ash mb-1"><Target size={14} /> Niche</span>
                      <span className="text-body text-graphite font-medium">{c.category}</span>
                    </div>
                    <div>
                      <span className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-ash mb-1"><MapPin size={14} /> Location</span>
                      <span className="text-body text-graphite font-medium">{c.location}</span>
                    </div>
                    <div className="col-span-2 pt-3 mt-1 border-t border-slate-custom/10">
                      <span className="block text-caption uppercase tracking-wide text-ash mb-1">Budget</span>
                      <span className="text-heading-sm font-bold text-emerald-status">{formatNepaliCurrency(c.budget)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-custom/10 mt-auto">
                  <div className="flex items-center gap-1.5 text-caption text-ash uppercase tracking-wide">
                    <Calendar size={14} />
                    {new Date(c.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    {(c.status === "OPEN" || c.status === "ACTIVE") && (
                      <>
                        <button onClick={() => setConfirmArchive(c.id)} className="flex items-center gap-1.5 rounded-buttons bg-amber-tag/10 text-amber-tag px-3 py-1.5 text-caption uppercase tracking-wide font-bold hover:bg-amber-tag/20 transition-colors">
                          <ArchiveX size={14} /> Archive
                        </button>
                        <button onClick={() => setConfirmCancel(c.id)} className="flex items-center gap-1.5 rounded-buttons bg-coral-alert/10 text-coral-alert px-3 py-1.5 text-caption uppercase tracking-wide font-bold hover:bg-coral-alert/20 transition-colors">
                          <Ban size={14} /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
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
        isOpen={!!confirmArchive}
        onClose={() => setConfirmArchive(null)}
        onConfirm={handleArchive}
        title="Archive Campaign"
        message="Are you sure you want to archive this campaign? This will hide it from the marketplace."
      />
      <ConfirmDialog
        isOpen={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        onConfirm={handleCancel}
        title="Cancel Campaign"
        message="Are you sure you want to cancel this campaign? Active collaborations may be affected."
      />
    </div>
  );
}
