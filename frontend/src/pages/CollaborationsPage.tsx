import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { Role } from "../constants/roles";
import { useBusinessCollaborations, usePromoterCollaborations } from "../features/collaboration/api";
import { useCompleteCollaboration, useCreateReview } from "../features/reviews/api";
import ReviewFormDialog from "../components/reviews/ReviewFormDialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { formatNepaliCurrency } from "../utils/currency";
import DeliverablesSection from "../features/collaboration/components/DeliverablesSection";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, Star, TrendingUp,
  Wallet, MessageCircle, Download, Filter,
  Building2, Briefcase, UserCheck, MoreVertical, Search as SearchIcon
} from "lucide-react";


function CardMenu({ collab, isBusiness, onComplete, onReview, onOpenChat }: any) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200 bg-white shadow-sm"
      >
        <MoreVertical size={16} />
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
            <button onClick={(e) => { e.stopPropagation(); onOpenChat(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <MessageCircle size={16} className="text-gray-400"/> Open Chat
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Download size={16} className="text-gray-400"/> Download Brief
            </button>
            
            {(collab.status === "ACTIVE" || collab.status === "COMPLETED") && (
              <div className="h-px bg-gray-100 my-1" />
            )}
            
            {collab.status === "ACTIVE" && (
              <button 
                onClick={(e) => { e.stopPropagation(); setOpen(false); onComplete(collab.id); }}
                className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 font-medium"
              >
                <CheckCircle2 size={16} className="text-emerald-500"/> Mark Complete
              </button>
            )}
            {collab.status === "COMPLETED" && !collab.has_review && (
              <button 
                onClick={(e) => { e.stopPropagation(); setOpen(false); onReview(collab.id); }}
                className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2 font-medium"
              >
                <Star size={16} className="text-amber-500"/> Write Review
              </button>
            )}
            {collab.status === "COMPLETED" && collab.has_review && (
              <div className="w-full text-left px-4 py-2 text-sm text-emerald-600 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500"/> Reviewed
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CollaborationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewingCollabId, setReviewingCollabId] = useState<string | null>(null);
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null);

  const isBusiness = user?.role === Role.BUSINESS;

  const bizQuery = useBusinessCollaborations({ page, limit: 10, status: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined }, isBusiness);
  const promQuery = usePromoterCollaborations({ page, limit: 10, status: statusFilter !== "all" ? statusFilter.toUpperCase() : undefined }, !isBusiness);
  const { data, isLoading, error } = isBusiness ? bizQuery : promQuery;

  const completeCollab = useCompleteCollaboration();
  const createReview = useCreateReview();

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 ring-1 ring-red-500/10">
        <XCircle size={32} className="text-red-500" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading workspace</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
    </div>
  );

  const handleComplete = (collabId: string) => setCompleteConfirm(collabId);
  
  const confirmComplete = () => {
    if (!completeConfirm) return;
    completeCollab.mutate(completeConfirm, {
      onSuccess: () => { notifySuccess("Project marked as complete!"); setCompleteConfirm(null); },
      onError: () => { notifyError("Failed to complete project"); setCompleteConfirm(null); },
    });
  };

  const handleReviewSubmit = (reviewData: { rating: number; comment?: string }) => {
    if (!reviewingCollabId) return;
    createReview.mutate({ collaborationId: reviewingCollabId, ...reviewData }, {
      onSuccess: () => { notifySuccess("Review submitted successfully!"); setReviewingCollabId(null); },
      onError: () => notifyError("Failed to submit review"),
    });
  };

  const handleOpenChat = (collabId: string) => {
    navigate("/messages", { state: { collaborationId: collabId } });
  };

  const collabs = data?.items || [];
  const activeCount = collabs.filter((c:any) => c.status === 'ACTIVE').length;
  const completedCount = collabs.filter((c:any) => c.status === 'COMPLETED').length;
  const pendingReviewCount = collabs.filter((c:any) => c.status === 'COMPLETED' && !c.has_review).length;
  const totalEarnings = collabs.filter((c:any) => c.status === 'COMPLETED').reduce((sum: number, c: any) => sum + (c.campaign_budget || 0), 0);
  const activeThisWeek = collabs.filter((c:any) => c.status === 'ACTIVE' && new Date(c.started_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      
      {/* 1. PREMIUM HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm ring-1 ring-gray-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Workspace</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl">
            {isBusiness ? "Manage your active and completed promoter partnerships." : "Manage your active and completed brand partnerships."}
          </p>
        </div>
        <div className="flex items-center gap-3">

          <Link
            to={isBusiness ? "/business/directory" : "/promoter/marketplace"}
            className="inline-flex items-center gap-2 bg-primary-600 text-white h-11 px-5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <SearchIcon size={16} /> {isBusiness ? "Find Promoters" : "Browse Campaigns"}
          </Link>
        </div>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Projects</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Clock size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          <p className="text-xs font-semibold text-emerald-600 mt-1">{activeThisWeek > 0 ? `↑ ${activeThisWeek} started this week` : 'No new projects this week'}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Completed</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
          <p className="text-xs text-gray-400 font-medium mt-1">All time</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pending Reviews</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Star size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{pendingReviewCount}</div>
          <p className="text-xs text-gray-400 font-medium mt-1">Awaiting your feedback</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Value</h3>
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center"><Wallet size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNepaliCurrency(totalEarnings)}</div>
          <p className="text-xs font-semibold text-emerald-600 mt-1">From completed projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN (12 cols) */}
        <div className="xl:col-span-12 space-y-6">
          
          {/* 3. FILTER TOOLBAR */}
          <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="bg-white p-2 rounded-2xl shadow-sm ring-1 ring-gray-200 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects by name or partner..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full h-12 pl-11 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-gray-400 text-gray-900"
                  />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 pb-1">
                {["All", "Active", "Completed", "Cancelled"].map(status => (
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

          {/* PROJECT LIST */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({length:6}).map((_,i) => <div key={i} className="bg-white rounded-2xl h-80 animate-pulse ring-1 ring-gray-100"></div>)}
            </div>
          ) : !collabs || collabs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4"><Briefcase size={32}/></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No active projects</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-6">You don't have any collaborations right now. Start by finding new partners.</p>
              <Link to={isBusiness ? "/business/directory" : "/promoter/marketplace"} className="h-11 px-6 flex items-center justify-center rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm">
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collabs.map((c: any) => {
                const isCompleted = c.status === "COMPLETED";
                
                const isActive = c.status === "ACTIVE";

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-primary-200 transition-all group flex flex-col overflow-hidden"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      
                      {/* Top Row */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-lg font-bold text-gray-700">
                            {c.partner_avatar_url ? (
                              <img src={c.partner_avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              c.partner_name?.slice(0, 2).toUpperCase() || "??"
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-gray-900 truncate pr-2">{c.campaign_title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate mt-0.5">
                              {isBusiness ? <UserCheck size={14}/> : <Building2 size={14}/>} {c.partner_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isActive ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}>
                            {c.status}
                          </span>
                          <CardMenu collab={c} isBusiness={isBusiness} onComplete={handleComplete} onReview={setReviewingCollabId} onOpenChat={() => handleOpenChat(c.id)} />
                        </div>
                      </div>

                      {/* Financials & Dates */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Budget</p>
                          <p className="text-sm font-bold text-gray-900">{formatNepaliCurrency(c.campaign_budget)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Timeline</p>
                          <p className="text-sm font-bold text-gray-900">
                            {isCompleted ? 'Completed' : c.campaign_end_date ? `${Math.max(0, Math.ceil((new Date(c.campaign_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left` : 'Ongoing'}
                          </p>
                        </div>
                      </div>

                      {/* Project Timeline */}
                      <div className="mt-auto pt-2">
                        <div className="flex items-center justify-between text-xs font-semibold mb-2">
                          <span className="text-gray-900">Project Progress</span>
                          <span className={isCompleted ? 'text-emerald-600' : 'text-blue-600'}>
                            {isCompleted ? '100%' : (() => {
                               if (!c.campaign_start_date || !c.campaign_end_date) return '50%';
                               const start = new Date(c.campaign_start_date).getTime();
                               const end = new Date(c.campaign_end_date).getTime();
                               const now = Date.now();
                               const p = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
                               return `${p}%`;
                            })()}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ 
                              width: isCompleted ? '100%' : (() => {
                                 if (!c.campaign_start_date || !c.campaign_end_date) return '50%';
                                 const start = new Date(c.campaign_start_date).getTime();
                                 const end = new Date(c.campaign_end_date).getTime();
                                 const now = Date.now();
                                 const p = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
                                 return `${p}%`;
                              })()
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                          <span className="text-gray-700">Agreement</span>
                          <span className={!isCompleted ? "text-blue-600" : "text-gray-700"}>Content</span>
                          <span className={isCompleted ? "text-emerald-600" : ""}>Review</span>
                        </div>
                      </div>

                      {/* Deliverables Section */}
                      {isActive && (
                        <div className="mt-4 border-t border-gray-100 pt-2">
                          <DeliverablesSection 
                            collaborationId={c.id} 
                            role={isBusiness ? "business" : "promoter"} 
                          />
                        </div>
                      )}

                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 border-t border-gray-100 p-4 flex gap-3">
                      {isActive && (
                        <button onClick={() => handleComplete(c.id)} className="flex-1 h-10 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-primary-600 shadow-sm transition-colors flex items-center justify-center gap-2">
                          <CheckCircle2 size={16}/> Complete
                        </button>
                      )}
                      {isCompleted && !c.has_review && (
                        <button onClick={() => setReviewingCollabId(c.id)} className="flex-1 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center justify-center gap-2">
                          <Star size={16}/> Write Review
                        </button>
                      )}
                      {isCompleted && c.has_review && (
                        <div className="flex-1 h-10 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 size={16}/> Reviewed
                        </div>
                      )}
                      <button onClick={() => handleOpenChat(c.id)} className="h-10 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center justify-center gap-2 flex-1">
                        <MessageCircle size={16}/> Chat
                      </button>
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
      </div>

      {reviewingCollabId && (
        <ReviewFormDialog
          open={!!reviewingCollabId}
          onClose={() => setReviewingCollabId(null)}
          onSubmit={handleReviewSubmit}
          title="Review Partner"
        />
      )}

      <ConfirmDialog
        isOpen={!!completeConfirm}
        onClose={() => setCompleteConfirm(null)}
        onConfirm={confirmComplete}
        title="Mark Complete"
        message="Are you sure you want to mark this collaboration as complete? This will notify your partner and move the project to the review phase."
      />
    </div>
  );
}