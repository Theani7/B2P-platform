import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBusinessInvitations, useCancelInvitation } from "../features/collaboration/api";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { StatCard, Avatar } from "../components/ui";
import { formatNepaliCurrency } from "../utils/currency";
import {
  Send, XCircle, MapPin, MessageSquare,
  UserPlus, Search, Clock, Users, Eye, MoreHorizontal,
  Archive, Filter, CheckCircle2, ChevronRight, ChevronLeft, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function useClickOutside(ref: any, handler: () => void) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

function ActionMenu({ inv, onCancel }: any) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setOpen(false));
  const navigate = useNavigate();

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm"
      >
        <MoreHorizontal size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-50 overflow-hidden py-1"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); navigate(`/business/campaigns/${inv.campaign_id}`); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye size={16} className="text-gray-400" /> View Campaign
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); if(inv.promoter?.username) navigate(`/promoters/${inv.promoter.username}`); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Users size={16} className="text-gray-400" /> View Promoter
            </button>
            {inv.status === "PENDING" && (
              <>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); setOpen(false); onCancel(inv.id); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <XCircle size={16} className="text-red-500" /> Cancel Invitation
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    ACCEPTED: { color: "text-emerald-700 bg-emerald-50 ring-emerald-600/20", icon: CheckCircle2, label: "Accepted" },
    PENDING: { color: "text-amber-700 bg-amber-50 ring-amber-600/20", icon: Clock, label: "Pending" },
    REJECTED: { color: "text-red-700 bg-red-50 ring-red-600/20", icon: XCircle, label: "Declined" },
    EXPIRED: { color: "text-gray-700 bg-gray-50 ring-gray-600/20", icon: Archive, label: "Expired" },
  };
  const c = config[status] || { color: "text-gray-700 bg-gray-50 ring-gray-600/20", icon: Send, label: status };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ring-1 ring-inset ${c.color} whitespace-nowrap`}>
      <Icon size={14} /> {c.label}
    </span>
  );
};

export default function BusinessInvitationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data, isLoading, error } = useBusinessInvitations({ page, limit: 10, status: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined });
  const cancelMutation = useCancelInvitation();
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  const navigate = useNavigate();

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 ring-1 ring-red-500/10">
        <XCircle size={32} className="text-red-500" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading invitations</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
    </div>
  );

  const confirmCancel = () => {
    if (!cancelConfirm) return;
    cancelMutation.mutate(cancelConfirm, {
      onSuccess: () => { notifySuccess("Invitation cancelled"); setCancelConfirm(null); },
      onError: (e) => { notifyError(e.message); setCancelConfirm(null); },
    });
  };

  const getInitialsColor = (title: string = "C") => {
    const colors = ["bg-primary-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-rose-500"];
    return colors[title.length % colors.length];
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sent Invitations</h1>
          <p className="text-sm text-gray-500 mt-1.5">Track every invitation you've sent and monitor promoter responses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/business/promoters"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 h-10 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
          >
            <UserPlus size={16} /> Browse Promoters
          </Link>
          <Link
            to="/business/campaigns/create"
            className="inline-flex items-center gap-2 bg-primary-600 text-white h-10 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm"
          >
            <Send size={16} /> Create Campaign
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Invitations Sent" value={data?.total ?? 0} icon={Send} subtitle="All time" />
        <StatCard label="Pending Responses" value={data?.items?.filter((i: any) => i.status === "PENDING").length || 0} icon={Clock} subtitle="Current page" />
        <StatCard label="Accepted Invitations" value={data?.items?.filter((i: any) => i.status === "ACCEPTED").length || 0} icon={CheckCircle2} subtitle="Current page" />
        <StatCard 
          label="Response Rate" 
          value={`${data?.items?.length ? Math.round((data.items.filter((i: any) => i.status !== "PENDING").length / data.items.length) * 100) : 0}%`} 
          icon={MessageSquare} 
          subtitle="Current page" 
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-2 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invitations by campaign or promoter..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 h-10 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-gray-900 placeholder-gray-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button className="h-10 px-4 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Calendar size={16} className="text-gray-400" /> Date Range
            </button>
            <button className="h-10 px-4 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Filter size={16} className="text-gray-400" /> Sort
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {["All", "Pending", "Accepted", "Declined", "Expired"].map(status => {
            const isActive = statusFilter === status.toLowerCase();
            return (
              <button
                key={status}
                onClick={() => { setStatusFilter(status.toLowerCase()); setPage(1); }}
                className={`whitespace-nowrap px-4 h-8 rounded-full text-xs font-semibold tracking-wide transition-colors border flex-shrink-0 ${
                  isActive ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Enterprise List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 ring-1 ring-gray-100 shadow-sm animate-pulse flex items-center gap-8">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-1/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="w-32 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5 ring-1 ring-gray-900/5">
              <Send size={32} className="text-gray-300 ml-1" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No invitations sent yet</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Start inviting promoters from the directory to collaborate on your active marketing campaigns.
            </p>
            <Link
              to="/business/promoters"
              className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white rounded-lg h-10 px-6 text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Users size={16} /> Browse Promoters
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Horizontal Scroll Wrapper to guarantee absolute no overlaps on smaller screens */}
            <div className="w-full overflow-x-auto pb-6 -mb-6">
              <div className="min-w-[1100px] flex flex-col gap-4">
                
                {/* Header Row for Desktop */}
                <div className="grid grid-cols-[minmax(260px,2.5fr)_minmax(220px,2fr)_minmax(180px,1.5fr)_minmax(320px,2.5fr)_140px] gap-8 px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div>Campaign</div>
                  <div>Promoter</div>
                  <div>Status</div>
                  <div>Message</div>
                  <div className="text-right">Actions</div>
                </div>

                {data.items.map((inv: any, index: number) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                    style={{ zIndex: 100 - index, position: 'relative' }}
                    className="grid grid-cols-[minmax(260px,2.5fr)_minmax(220px,2fr)_minmax(180px,1.5fr)_minmax(320px,2.5fr)_140px] gap-8 items-center p-6 bg-white rounded-xl shadow-sm ring-1 ring-gray-200 hover:ring-primary-300 hover:shadow-md transition-all group"
                  >
                    {/* Campaign Column */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0 ${getInitialsColor(inv.campaign_title)}`}>
                        {inv.campaign_title?.charAt(0).toUpperCase() || "C"}
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <p className="text-[20px] leading-tight font-bold text-gray-900 truncate">{inv.campaign_title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">{inv.campaign_category}</span>
                          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{formatNepaliCurrency(inv.campaign_budget)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Promoter Column */}
                    <div 
                      className="flex items-center gap-3 cursor-pointer group/promoter hover:bg-gray-50 p-2 -ml-2 rounded-lg transition-colors min-w-0"
                      onClick={() => inv.promoter?.username && navigate(`/promoters/${inv.promoter.username}`)}
                    >
                      {inv.promoter?.avatar_url ? (
                        <img src={inv.promoter.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50 flex-shrink-0" />
                      ) : (
                        <Avatar initials={inv.promoter?.username?.[0]?.toUpperCase() ?? "P"} size="md" colorIndex={1} />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-gray-900 truncate group-hover/promoter:text-primary-600 transition-colors">
                          {inv.promoter?.username || "Promoter"}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                          <MapPin size={12} className="flex-shrink-0" /> <span className="truncate">{inv.campaign_location || "Remote"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status & Timeline Column */}
                    <div className="flex flex-col gap-3 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={inv.status} />
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                          {new Date(inv.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      
                      {/* Premium Timeline Progress */}
                      <div className="flex items-center w-full max-w-[140px]">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary-500 ring-2 ring-primary-50" />
                        </div>
                        <div className={`h-0.5 flex-1 mx-1 rounded-full ${inv.status !== 'PENDING' ? 'bg-primary-500' : 'bg-gray-200'}`} />
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={`w-2.5 h-2.5 rounded-full ring-2 ${
                            inv.status === 'ACCEPTED' ? 'bg-emerald-500 ring-emerald-50' : 
                            inv.status === 'REJECTED' ? 'bg-red-500 ring-red-50' : 
                            inv.status === 'PENDING' ? 'bg-amber-400 ring-amber-50' : 'bg-gray-200 ring-gray-50'
                          }`} />
                        </div>
                      </div>
                    </div>

                    {/* Message Bubble Column */}
                    <div className="w-full min-w-0">
                      {inv.message ? (
                        <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-3 relative group/msg transition-colors hover:bg-gray-100 w-full overflow-hidden">
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed relative z-10 break-words">
                            {inv.message}
                          </p>
                          {/* Gradient fade out effect */}
                          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50/80 group-hover/msg:from-gray-100 to-transparent rounded-b-2xl pointer-events-none" />
                          
                          {/* Tooltip on hover */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-[110%] mb-2 hidden group-hover/msg:block w-64 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-50 whitespace-pre-wrap leading-relaxed ring-1 ring-white/10 break-words pointer-events-none">
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 border-r border-b border-white/10" />
                            {inv.message}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50/50 border border-gray-100 border-dashed rounded-2xl p-4 flex items-center justify-center gap-2 whitespace-nowrap">
                          <MessageSquare size={16} className="text-gray-300 flex-shrink-0" />
                          <span className="text-sm text-gray-400 italic font-medium truncate">No custom message</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Column */}
                    <div className="flex items-center justify-end gap-2 w-[140px] flex-shrink-0">
                      <div className="flex-1">
                        {inv.status === "ACCEPTED" ? (
                          <button 
                            onClick={() => navigate("/business/collaborations")}
                            className="w-full bg-primary-600 text-white h-10 px-3 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap"
                          >
                            View Collab
                          </button>
                        ) : inv.status === "PENDING" ? (
                          <button 
                            onClick={() => setCancelConfirm(inv.id)}
                            className="w-full bg-white border border-gray-200 text-gray-700 h-10 px-3 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button 
                            onClick={() => inv.promoter?.username && navigate(`/promoters/${inv.promoter.username}`)}
                            className="w-full bg-white border border-gray-200 text-gray-700 h-10 px-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
                          >
                            Profile
                          </button>
                        )}
                      </div>
                      <ActionMenu inv={inv} onCancel={setCancelConfirm} />
                    </div>
                  </motion.div>
                ))}

              </div>
            </div>

            {/* Pagination */}
            {data.pages > 0 && (
              <div className="bg-white px-6 py-4 rounded-xl shadow-sm ring-1 ring-gray-200 flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-900">{(page - 1) * 10 + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(page * 10, data.total || page * 10)}</span> of <span className="font-semibold text-gray-900">{data.total || "?"}</span> invitations
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        onConfirm={confirmCancel}
        title="Cancel Invitation"
        message="Are you sure you want to cancel this invitation? The promoter will be notified that the offer was withdrawn."
      />
    </div>
  );
}
