import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePromoterInvitations, useAcceptInvitation, useRejectInvitation } from "../features/collaboration/api";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { formatNepaliCurrency } from "../utils/currency";
import { motion } from "framer-motion";
import {
  Mail, Building2, Clock, MapPin, Briefcase, Star, Sparkles,
  CheckCircle2, XCircle, AlertCircle, MessageCircle,
  Search, Filter, Link as BarChart3, Inbox
} from "lucide-react";
import CampaignPreviewModal from "../components/discovery/CampaignPreviewModal";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-amber-50 text-amber-700 ring-amber-600/20", icon: Clock, label: "Action Required" },
  ACCEPTED: { color: "bg-emerald-status/10 text-emerald-status ring-emerald-status/20", icon: CheckCircle2, label: "Accepted" },
  REJECTED: { color: "bg-coral-alert/10 text-coral-alert ring-red-600/20", icon: XCircle, label: "Declined" },
  EXPIRED: { color: "bg-linen-canvas text-ash ring-gray-600/20", icon: AlertCircle, label: "Expired" },
};

export default function PromoterInvitationsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data, isLoading, error } = usePromoterInvitations({ page, limit: 10, status: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined });
  const acceptMutation = useAcceptInvitation();
  const rejectMutation = useRejectInvitation();
  const [actionConfirm, setActionConfirm] = useState<{ id: string; action: "accept" | "reject" } | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<any | null>(null);

  const navigate = useNavigate();

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-coral-alert/10 flex items-center justify-center mb-4 ring-1 ring-coral-alert/10">
        <AlertCircle size={32} className="text-coral-alert" />
      </div>
      <p className="text-lg font-medium text-graphite">Error loading inbox</p>
      <p className="text-sm text-ash mt-1">{(error as Error).message}</p>
    </div>
  );

  const handleAction = (id: string, action: "accept"|"reject", e: React.MouseEvent) => {
    e.preventDefault();
    setActionConfirm({ id, action });
  };

  const confirmAction = () => {
    if (!actionConfirm) return;
    if (actionConfirm.action === "accept") {
      acceptMutation.mutate(actionConfirm.id, {
        onSuccess: () => { notifySuccess("Invitation accepted! Collaboration created."); setActionConfirm(null); },
        onError: (e) => { notifyError(e.message); setActionConfirm(null); },
      });
    } else {
      rejectMutation.mutate(actionConfirm.id, {
        onSuccess: () => { notifySuccess("Invitation declined."); setActionConfirm(null); },
        onError: (e) => { notifyError(e.message); setActionConfirm(null); },
      });
    }
  };

  const invites = data?.items || [];
  const pendingCount = invites.filter((i:any) => i.status === 'PENDING').length;
  const acceptedCount = invites.filter((i:any) => i.status === 'ACCEPTED').length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      
      {/* 1. PREMIUM HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-graphite">My Invitations</h1>
          <p className="text-sm text-ash mt-2 max-w-xl">Review and manage exclusive collaboration requests sent directly from verified businesses.</p>
        </div>
        <div className="flex items-center gap-3">

          <Link
            to="/promoter/marketplace"
            className="inline-flex items-center gap-2 bg-primary-600 text-white h-11 px-5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-product-card-sm"
          >
            <Search size={16} /> Marketplace
          </Link>
        </div>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Total Received</h3>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Mail size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{data?.total ?? 0}</div>
          <p className="text-xs text-ash mt-1">All time</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Pending</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-tag flex items-center justify-center"><Clock size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{pendingCount}</div>
          <p className="text-xs text-amber-tag font-medium mt-1">Needs attention</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Accepted</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-status/10 text-emerald-status flex items-center justify-center"><CheckCircle2 size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{acceptedCount}</div>
          <p className="text-xs font-semibold text-emerald-status mt-1">Converted to collab</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Accept Rate</h3>
            <div className="w-8 h-8 rounded-lg bg-sky-wash text-signal-blue flex items-center justify-center"><Star size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-graphite">
            {invites.length > 0 ? Math.round((acceptedCount / invites.length) * 100) : 0}%
          </div>
          <p className="text-xs text-fog font-medium mt-1">Based on current page</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN (12 cols) */}
        <div className="lg:col-span-12 space-y-6">
          
          {/* 3. STICKY FILTER TOOLBAR */}
          <div className="sticky top-0 z-30 bg-linen-canvas/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="bg-white p-2 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 flex flex-col gap-3">
              <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 pb-1">
                {["All", "Pending", "Accepted", "Declined"].map(status => (
                  <button 
                    key={status}
                    onClick={() => setStatusFilter(status.toLowerCase())}
                    className={`whitespace-nowrap px-4 h-8 rounded-full text-xs font-semibold tracking-wide transition-colors border ${
                      statusFilter === status.toLowerCase() 
                      ? 'bg-gray-900 text-white border-gray-900' 
                      : 'bg-white text-ash border-slate-custom/10 hover:bg-linen-canvas'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INVITATION LIST */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({length:4}).map((_,i) => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse ring-1 ring-gray-100"></div>)}
            </div>
          ) : !invites || invites.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-linen-canvas rounded-full flex items-center justify-center text-gray-300 mb-4"><Inbox size={32}/></div>
              <h2 className="text-xl font-bold text-graphite mb-2">Inbox is empty</h2>
              <p className="text-sm text-ash max-w-sm mb-6">You don't have any pending invitations right now. Complete your profile to attract more brands.</p>
              <Link to="/promoter/profile" className="h-11 px-6 flex items-center justify-center rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-product-card-sm">
                Complete Profile
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invites.map((inv: any, index: number) => {
                const conf = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = conf.icon;
                const isPending = inv.status === 'PENDING';
                const isAccepted = inv.status === 'ACCEPTED';
                
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-product-card-sm ring-1 ring-gray-200 hover:shadow-product-card-product-card hover:ring-primary-200 transition-all flex flex-col"
                  >
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-white ring-1 ring-gray-200 flex items-center justify-center flex-shrink-0 text-xl font-bold text-indigo-600">
                          {inv.business_name?.charAt(0).toUpperCase() || 'B'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-graphite truncate">{inv.business_name}</h3>
                          <p className="text-xs text-ash flex items-center gap-1.5 truncate mt-0.5">
                            <Building2 size={12}/> Verified Business
                          </p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset whitespace-nowrap ${conf.color}`}>
                        <StatusIcon size={14}/> {conf.label}
                      </span>
                    </div>

                    {/* Earnings */}
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-sm font-bold text-graphite flex items-center gap-1">
                        {formatNepaliCurrency(inv.campaign_budget)} <span className="text-xs text-fog font-medium">budget</span>
                      </span>
                    </div>

                    {/* Campaign Info */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-graphite mb-1">{inv.campaign_title}</h4>
                      <div className="flex items-center gap-3 text-xs text-ash">
                        <span className="flex items-center gap-1"><Briefcase size={12}/> {inv.campaign_category}</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> {inv.campaign_location || 'Remote'}</span>
                      </div>
                    </div>

                    {/* Message Preview */}
                    <div className="bg-linen-canvas rounded-xl p-4 border border-slate-custom/10 mb-6 relative group/msg">
                      <div className="flex items-start gap-2">
                        <MessageCircle size={14} className="text-fog mt-0.5 flex-shrink-0"/>
                        <p className="text-sm text-ash line-clamp-3 italic">
                          {inv.message || "We loved your recent content and would like to invite you to collaborate on our upcoming campaign. We think your audience is a perfect fit!"}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto border-t border-slate-custom/10 pt-5">
                      
                      {isPending ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => handleAction(inv.id, 'accept', e)} 
                            disabled={acceptMutation.isPending}
                            className="flex-1 h-10 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-primary-600 transition-colors shadow-product-card-sm"
                          >
                            Accept Offer
                          </button>
                          <button 
                            onClick={(e) => handleAction(inv.id, 'reject', e)}
                            disabled={rejectMutation.isPending}
                            className="flex-1 h-10 rounded-xl bg-white border border-slate-custom/10 text-graphite text-sm font-bold hover:bg-linen-canvas transition-colors shadow-product-card-sm"
                          >
                            Decline
                          </button>
                        </div>
                      ) : isAccepted ? (
                        <button onClick={() => navigate('/promoter/collaborations')} className="w-full h-10 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-product-card-sm">
                          Open Collaboration
                        </button>
                      ) : (
                        <button onClick={() => setPreviewCampaign({
                          id: inv.campaign_id,
                          business_name: inv.business_name,
                          title: inv.campaign_title,
                          category: inv.campaign_category,
                          budget: inv.campaign_budget,
                          location: inv.campaign_location,
                          description: inv.message
                        })} className="w-full h-10 rounded-xl bg-sky-wash text-ash text-sm font-bold hover:bg-gray-200 transition-colors">
                          View Campaign Details
                        </button>
                      )}
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[10px] text-fog font-semibold">Received: {new Date(inv.created_at).toLocaleDateString()}</span>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="h-10 px-4 rounded-xl border border-slate-custom/10 text-sm font-semibold hover:bg-linen-canvas disabled:opacity-50">Prev</button>
              <div className="flex items-center gap-1">
                {Array.from({length: data.pages}, (_,i) => i+1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold ${p === page ? 'bg-gray-900 text-white' : 'text-ash hover:bg-sky-wash'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={() => setPage(p => Math.min(data.pages, p+1))} disabled={page === data.pages} className="h-10 px-4 rounded-xl border border-slate-custom/10 text-sm font-semibold hover:bg-linen-canvas disabled:opacity-50">Next</button>
            </div>
          )}
        </div>

      </div>

      <ConfirmDialog
        isOpen={!!actionConfirm}
        onClose={() => setActionConfirm(null)}
        onConfirm={confirmAction}
        title={actionConfirm?.action === "accept" ? "Accept Offer" : "Decline Offer"}
        message={actionConfirm?.action === "accept" ? "Are you sure you want to accept this invitation? This will instantly start a new collaboration project." : "Are you sure you want to decline? The business will be notified."}
      />

      <CampaignPreviewModal
        campaign={previewCampaign}
        onClose={() => setPreviewCampaign(null)}
        onApply={() => {}}
      />
    </div>
  );
}