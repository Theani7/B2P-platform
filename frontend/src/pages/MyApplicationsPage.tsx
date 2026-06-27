import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePromoterApplications, useWithdrawApplication } from "../features/collaboration/api";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Dialog } from "../components/ui/Dialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { formatNepaliCurrency } from "../utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Briefcase, Building2, MapPin, Clock,
  CheckCircle, CircleDashed, XCircle, Eye, TrendingUp, MessageSquare, MoreHorizontal, Search, Filter,
  ChevronRight, ChevronLeft, Send, BarChart3, AlertCircle, Share2
} from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-amber-50 text-amber-700 ring-amber-600/20", icon: Clock, label: "Pending Review" },
  ACCEPTED: { color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", icon: CheckCircle, label: "Accepted" },
  REJECTED: { color: "bg-red-50 text-red-700 ring-red-600/20", icon: XCircle, label: "Declined" },
  WITHDRAWN: { color: "bg-gray-50 text-gray-600 ring-gray-600/20", icon: CircleDashed, label: "Withdrawn" },
};

function ApplicationMenu({ app, onWithdraw, onViewBusiness }: any) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <MoreHorizontal size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-20 py-1"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setOpen(false); navigate(`/promoter/marketplace?campaignId=${app.campaign_id}`); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye size={16} className="text-gray-400"/> View Campaign
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setOpen(false); onViewBusiness(app); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Building2 size={16} className="text-gray-400"/> View Business
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setOpen(false); 
                const shareUrl = `${window.location.origin}/promoter/marketplace?campaignId=${app.campaign_id}`;
                if (navigator.share) {
                  navigator.share({
                    title: app.campaign_title,
                    text: `Check out the campaign: ${app.campaign_title}`,
                    url: shareUrl,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(shareUrl);
                  notifySuccess("Campaign link copied to clipboard!");
                }
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Share2 size={16} className="text-gray-400"/> Share
            </button>
            
            {app.status === "PENDING" && (
              <>
                <div className="h-px bg-gray-100 my-1" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setOpen(false); onWithdraw(app.id); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <XCircle size={16} className="text-red-500"/> Withdraw Application
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MyApplicationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [withdrawConfirm, setWithdrawConfirm] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);

  const navigate = useNavigate();

  const { data, isLoading, error } = usePromoterApplications({ page, limit: 100 });
  const withdrawMutation = useWithdrawApplication();

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 ring-1 ring-red-500/10">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading applications</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
    </div>
  );

  const confirmWithdraw = () => {
    if (!withdrawConfirm) return;
    withdrawMutation.mutate(withdrawConfirm, {
      onSuccess: () => { notifySuccess("Application withdrawn"); setWithdrawConfirm(null); },
      onError: (e) => { notifyError(e.message); setWithdrawConfirm(null); },
    });
  };

  const applications = data?.items || [];
  const pendingCount = applications.filter((a:any) => a.status === 'PENDING').length;
  const acceptedCount = applications.filter((a:any) => a.status === 'ACCEPTED').length;
  const rejectedCount = applications.filter((a:any) => a.status === 'REJECTED').length;

  let filteredApplications = [...applications];
  
  if (statusFilter !== "all") {
    filteredApplications = filteredApplications.filter((a: any) => a.status?.toLowerCase() === statusFilter);
  }
  
  if (search.trim()) {
    const q = search.toLowerCase();
    filteredApplications = filteredApplications.filter((a: any) => 
      a.campaign_title?.toLowerCase().includes(q) || 
      a.business_name?.toLowerCase().includes(q) ||
      a.campaign_category?.toLowerCase().includes(q)
    );
  }

  if (sortOrder === "newest") {
    filteredApplications.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  } else if (sortOrder === "oldest") {
    filteredApplications.sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
  } else if (sortOrder === "highest_budget") {
    filteredApplications.sort((a: any, b: any) => (b.campaign_budget || 0) - (a.campaign_budget || 0));
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm ring-1 ring-gray-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl">Track every campaign you've applied for, monitor progress, and manage your creator pipeline.</p>
        </div>
        <div className="flex items-center gap-3">

          <Link
            to="/promoter/marketplace"
            className="inline-flex items-center gap-2 bg-primary-600 text-white h-11 px-5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Search size={16} /> Browse Marketplace
          </Link>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Submitted</h3>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Send size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.total ?? 0}</div>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pending</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Clock size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
          <p className="text-xs text-amber-600 font-medium mt-1">Awaiting response</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Accepted</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{acceptedCount}</div>
          <p className="text-xs text-gray-500 mt-1">Current page</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Rejected</h3>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><XCircle size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{rejectedCount}</div>
          <p className="text-xs text-gray-500 mt-1">Current page</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200 md:col-span-1 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Accept Rate</h3>
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center"><TrendingUp size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {applications.length > 0 ? Math.round((acceptedCount / applications.length) * 100) : 0}%
          </div>
          <p className="text-xs text-gray-400 font-medium mt-1">Current page</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN LIST COLUMN */}
        <div className="lg:col-span-12 space-y-6">
          
          {/* TOOLBAR */}
          <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="bg-white p-2 rounded-2xl shadow-sm ring-1 ring-gray-200 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns or businesses..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full h-12 pl-11 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-gray-400 text-gray-900"
                  />
                </div>
                <div className="hidden md:flex items-center gap-2 pr-2">
                  <div className="h-8 w-px bg-gray-100 mx-2"></div>
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="h-10 pl-4 pr-10 text-sm font-medium text-gray-700 bg-gray-50 border-none rounded-xl focus:ring-0 cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest_budget">Highest Budget</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 pb-1">
                {["All", "Pending", "Accepted", "Rejected", "Withdrawn"].map(status => (
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

          {/* APPLICATION LIST */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({length:4}).map((_,i) => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse ring-1 ring-gray-100"></div>)}
            </div>
          ) : !applications || applications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4"><FileText size={32}/></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-6">You haven't applied to any campaigns. Browse the marketplace to find collaborations.</p>
              <Link to="/promoter/marketplace" className="h-11 px-6 flex items-center justify-center rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm">
                Browse Marketplace
              </Link>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4"><Filter size={32}/></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No results found</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-6">No applications match your current filters. Try adjusting your search or status filter.</p>
              <button onClick={() => { setStatusFilter('all'); setSearch(''); }} className="h-11 px-6 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors shadow-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app: any, index: number) => {
                const conf = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = conf.icon;
                
                // Determine timeline steps based on status
                const isAccepted = app.status === 'ACCEPTED';
                const isRejected = app.status === 'REJECTED';
                const isWithdrawn = app.status === 'WITHDRAWN';
                
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ zIndex: 100 - index, position: 'relative' }}
                    className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-primary-200 transition-all group flex flex-col"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      
                      {/* Left: Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-white ring-1 ring-gray-200 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-indigo-600">
                          {app.campaign_title?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{app.campaign_title}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                            <Building2 size={14}/> {app.business_name || "Business"}
                            <span className="mx-1">•</span>
                            <Briefcase size={14}/> {app.campaign_category}
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">{formatNepaliCurrency(app.campaign_budget)}</span>
                            <span className="text-sm font-medium text-gray-500 flex items-center gap-1"><MapPin size={14}/> {app.campaign_location || "Remote"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ring-1 ring-inset ${conf.color}`}>
                          <StatusIcon size={14}/> {conf.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {app.status === 'PENDING' && (
                            <button onClick={() => setWithdrawConfirm(app.id)} className="h-9 px-4 bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg text-xs font-bold transition-colors">
                              Withdraw
                            </button>
                          )}
                          {app.status === 'ACCEPTED' && (
                            <button onClick={() => navigate('/promoter/collaborations')} className="h-9 px-4 bg-primary-600 text-white rounded-lg text-xs font-bold transition-colors hover:bg-primary-700 shadow-sm">
                              View Collab
                            </button>
                          )}
                          <ApplicationMenu 
                            app={app} 
                            onWithdraw={setWithdrawConfirm} 
                            onViewBusiness={setSelectedBusiness} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-6">
                      
                      {/* Timeline */}
                      <div className="flex-1 w-full flex items-center max-w-sm">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-emerald-50 z-10"><CheckCircle size={12}/></div>
                          <span className="text-[10px] font-bold text-gray-900 mt-2 uppercase tracking-wider">Submitted</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-emerald-500 -mx-2 -mt-5 z-0"></div>
                        
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-emerald-50 z-10"><CheckCircle size={12}/></div>
                          <span className="text-[10px] font-bold text-gray-900 mt-2 uppercase tracking-wider">Viewed</span>
                        </div>
                        
                        <div className={`flex-1 h-0.5 -mx-2 -mt-5 z-0 ${isAccepted || isRejected ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                        
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ring-4 z-10 ${
                            isAccepted 
                            ? 'bg-emerald-500 text-white ring-emerald-50' 
                            : isRejected 
                            ? 'bg-red-500 text-white ring-red-50'
                            : isWithdrawn
                            ? 'bg-gray-400 text-white ring-gray-50'
                            : 'bg-white border-2 border-gray-300 text-transparent ring-white'
                          }`}>
                            {isRejected ? <XCircle size={12}/> : isWithdrawn ? <CircleDashed size={12}/> : <CheckCircle size={12}/>}
                          </div>
                          <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                            isAccepted ? 'text-emerald-700' : isRejected ? 'text-red-600' : isWithdrawn ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {isAccepted ? 'Accepted' : isRejected ? 'Declined' : isWithdrawn ? 'Withdrawn' : 'Decision'}
                          </span>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-xl p-4 h-full border border-gray-100 flex items-start gap-3 relative overflow-hidden group/msg">
                          <MessageSquare size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-700 mb-1">Your Cover Message</p>
                            <p className="text-sm text-gray-500 line-clamp-2 italic pr-4">
                              {app.message ? `"${app.message}"` : "No cover message provided."}
                            </p>
                          </div>
                          {/* Hover Tooltip for full message */}
                          {app.message && app.message.length > 80 && (
                            <div className="absolute left-0 bottom-[105%] mb-2 hidden group-hover/msg:block w-full bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-30 whitespace-pre-wrap">
                              {app.message}
                            </div>
                          )}
                        </div>
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
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"><ChevronLeft size={16}/> Prev</button>
              <div className="flex items-center gap-1">
                {Array.from({length: data.pages}, (_,i) => i+1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold ${p === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={() => setPage(p => Math.min(data.pages, p+1))} disabled={page === data.pages} className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1">Next <ChevronRight size={16}/></button>
            </div>
          )}
        </div>



      </div>

      <ConfirmDialog
        isOpen={!!withdrawConfirm}
        onClose={() => setWithdrawConfirm(null)}
        onConfirm={confirmWithdraw}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? The business will be notified that you are no longer interested."
      />

      {selectedBusiness && (
        <Dialog
          isOpen={!!selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          title="About the Business"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business Name</span>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedBusiness.business_name || "Business Profile"}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Associated Campaign</span>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{selectedBusiness.campaign_title}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</span>
              <p className="text-sm text-gray-600 mt-0.5">{selectedBusiness.campaign_location || "Remote"}</p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedBusiness(null)}
                className="h-10 px-5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
