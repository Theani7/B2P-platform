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

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-amber-50 text-amber-700 ring-amber-600/20", icon: Clock, label: "Action Required" },
  ACCEPTED: { color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", icon: CheckCircle2, label: "Accepted" },
  REJECTED: { color: "bg-red-50 text-red-700 ring-red-600/20", icon: XCircle, label: "Declined" },
  EXPIRED: { color: "bg-gray-50 text-gray-600 ring-gray-600/20", icon: AlertCircle, label: "Expired" },
};

export default function PromoterInvitationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data, isLoading, error } = usePromoterInvitations({ page, limit: 10 });
  const acceptMutation = useAcceptInvitation();
  const rejectMutation = useRejectInvitation();
  const [actionConfirm, setActionConfirm] = useState<{ id: string; action: "accept" | "reject" } | null>(null);

  const navigate = useNavigate();

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 ring-1 ring-red-500/10">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading inbox</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm ring-1 ring-gray-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Invitations</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl">Review and manage exclusive collaboration requests sent directly from verified businesses.</p>
        </div>
        <div className="flex items-center gap-3">

          <Link
            to="/promoter/marketplace"
            className="inline-flex items-center gap-2 bg-primary-600 text-white h-11 px-5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Search size={16} /> Marketplace
          </Link>
        </div>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Received</h3>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Mail size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.total ?? "—"}</div>
          <p className="text-xs font-semibold text-emerald-600 mt-1">↑ 22% vs last month</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pending</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Clock size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
          <p className="text-xs text-amber-600 font-medium mt-1">Needs attention</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Accepted</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{acceptedCount}</div>
          <p className="text-xs font-semibold text-emerald-600 mt-1">↑ 4 new collabs</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Accept Rate</h3>
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center"><Star size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">82%</div>
          <p className="text-xs text-gray-400 font-medium mt-1">Excellent fit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* 3. STICKY FILTER TOOLBAR */}
          <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="bg-white p-2 rounded-2xl shadow-sm ring-1 ring-gray-200 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search businesses or campaigns..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full h-12 pl-11 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-gray-400 text-gray-900"
                  />
                </div>
                <div className="hidden md:flex items-center gap-2 pr-2">
                  <div className="h-8 w-px bg-gray-100 mx-2"></div>
                  <button className="h-10 px-4 rounded-xl bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <Filter size={16}/> Filter
                  </button>
                  <select className="h-10 pl-4 pr-10 text-sm font-medium text-gray-700 bg-gray-50 border-none rounded-xl focus:ring-0 cursor-pointer">
                    <option>Newest Received</option>
                    <option>Highest Budget</option>
                    <option>Deadline Ending</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 pb-1">
                {["All", "Pending", "Accepted", "Declined", "High Budget"].map(status => (
                  <button 
                    key={status}
                    onClick={() => setStatusFilter(status.toLowerCase())}
                    className={`whitespace-nowrap px-4 h-8 rounded-full text-xs font-semibold tracking-wide transition-colors border ${
                      statusFilter === status.toLowerCase() 
                      ? 'bg-gray-900 text-white border-gray-900' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4"><Inbox size={32}/></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Inbox is empty</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-6">You don't have any pending invitations right now. Complete your profile to attract more brands.</p>
              <Link to="/promoter/profile" className="h-11 px-6 flex items-center justify-center rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm">
                Complete Profile
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invites.map((inv: any) => {
                const conf = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = conf.icon;
                const isPending = inv.status === 'PENDING';
                const isAccepted = inv.status === 'ACCEPTED';
                
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-primary-200 transition-all flex flex-col"
                  >
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-white ring-1 ring-gray-200 flex items-center justify-center flex-shrink-0 text-xl font-bold text-indigo-600">
                          {inv.business_name?.charAt(0).toUpperCase() || 'B'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-gray-900 truncate">{inv.business_name}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate mt-0.5">
                            <Building2 size={12}/> Verified Business
                          </p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset whitespace-nowrap ${conf.color}`}>
                        <StatusIcon size={14}/> {conf.label}
                      </span>
                    </div>

                    {/* Match & Earnings */}
                    <div className="flex items-center gap-3 mb-5">
                      <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded border border-emerald-100">
                        <Sparkles size={12}/> 94% Match
                      </span>
                      <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                        {formatNepaliCurrency(inv.campaign_budget)} <span className="text-xs text-gray-400 font-medium">budget</span>
                      </span>
                    </div>

                    {/* Campaign Info */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">{inv.campaign_title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Briefcase size={12}/> {inv.campaign_category}</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> {inv.campaign_location || 'Remote'}</span>
                      </div>
                    </div>

                    {/* Message Preview */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 relative group/msg">
                      <div className="flex items-start gap-2">
                        <MessageCircle size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                        <p className="text-sm text-gray-600 line-clamp-3 italic">
                          {inv.message || "We loved your recent content and would like to invite you to collaborate on our upcoming campaign. We think your audience is a perfect fit!"}
                        </p>
                      </div>
                      <button className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-2 hover:underline">Read Full Invitation</button>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto border-t border-gray-100 pt-5">
                      
                      {isPending ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => handleAction(inv.id, 'accept', e)} 
                            disabled={acceptMutation.isPending}
                            className="flex-1 h-10 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-primary-600 transition-colors shadow-sm"
                          >
                            Accept Offer
                          </button>
                          <button 
                            onClick={(e) => handleAction(inv.id, 'reject', e)}
                            disabled={rejectMutation.isPending}
                            className="flex-1 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            Decline
                          </button>
                        </div>
                      ) : isAccepted ? (
                        <button onClick={() => navigate('/promoter/collaborations')} className="w-full h-10 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm">
                          Open Collaboration
                        </button>
                      ) : (
                        <button className="w-full h-10 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-colors">
                          View Campaign Details
                        </button>
                      )}
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[10px] text-gray-400 font-semibold">Received: {new Date(inv.created_at).toLocaleDateString()}</span>
                        {isPending && <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1"><Clock size={10}/> Expires in 48h</span>}
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
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <div className="flex items-center gap-1">
                {Array.from({length: data.pages}, (_,i) => i+1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold ${p === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={() => setPage(p => Math.min(data.pages, p+1))} disabled={page === data.pages} className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>

        {/* SIDEBAR COLUMN (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-sm ring-1 ring-indigo-100 p-5">
            <h2 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2"><Sparkles size={16} className="text-indigo-500"/> Inbox Insights</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              You are currently responding to invitations faster than 85% of creators on the platform. Keep it up!
            </p>
            <div className="bg-white rounded-xl p-3 border border-indigo-50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Avg. Response Time</span>
              <span className="text-sm font-bold text-indigo-600">2.4 hours</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-5">Recent Activity</h2>
            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5"><Mail size={14} className="text-blue-500"/></div>
                <div>
                  <p className="text-sm text-gray-900 font-medium leading-snug">Invitation received</p>
                  <p className="text-xs text-gray-400 mt-1">2h ago from Nike</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 size={14} className="text-emerald-500"/></div>
                <div>
                  <p className="text-sm text-gray-900 font-medium leading-snug">Collaboration started</p>
                  <p className="text-xs text-gray-400 mt-1">1d ago with Adidas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <ConfirmDialog
        isOpen={!!actionConfirm}
        onClose={() => setActionConfirm(null)}
        onConfirm={confirmAction}
        title={actionConfirm?.action === "accept" ? "Accept Offer" : "Decline Offer"}
        message={actionConfirm?.action === "accept" ? "Are you sure you want to accept this invitation? This will instantly start a new collaboration project." : "Are you sure you want to decline? The business will be notified."}
      />
    </div>
  );
}
