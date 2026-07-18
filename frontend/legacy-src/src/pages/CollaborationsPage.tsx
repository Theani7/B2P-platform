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
        className="w-8 h-8 rounded-full flex items-center justify-center text-fog hover:bg-sky-wash hover:text-graphite transition-colors border border-slate-custom/10 bg-white shadow-product-card-sm"
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
            className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-product-card-product-card shadow-product-card-product-card z-20 py-1"
          >
            <button onClick={(e) => { e.stopPropagation(); onOpenChat(); }} className="w-full text-left px-4 py-2 text-sm text-graphite hover:bg-linen-canvas flex items-center gap-2">
              <MessageCircle size={16} className="text-fog"/> Open Chat
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-graphite hover:bg-linen-canvas flex items-center gap-2">
              <Download size={16} className="text-fog"/> Download Brief
            </button>
            
            {(collab.status === "ACTIVE" || collab.status === "COMPLETED") && (
              <div className="h-px bg-sky-wash my-1" />
            )}
            
            {collab.status === "ACTIVE" && (
              <button 
                onClick={(e) => { e.stopPropagation(); setOpen(false); onComplete(collab.id); }}
                className="w-full text-left px-4 py-2 text-sm text-emerald-status hover:bg-emerald-status/10 flex items-center gap-2 font-medium"
              >
                <CheckCircle2 size={16} className="text-emerald-status"/> Mark Complete
              </button>
            )}
            {collab.status === "COMPLETED" && !collab.has_review && (
              <button 
                onClick={(e) => { e.stopPropagation(); setOpen(false); onReview(collab.id); }}
                className="w-full text-left px-4 py-2 text-sm text-amber-tag hover:bg-amber-50 flex items-center gap-2 font-medium"
              >
                <Star size={16} className="text-amber-500"/> Write Review
              </button>
            )}
            {collab.status === "COMPLETED" && collab.has_review && (
              <div className="w-full text-left px-4 py-2 text-sm text-emerald-status flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-status"/> Reviewed
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
      <div className="w-16 h-16 rounded-2xl bg-coral-alert/10 flex items-center justify-center mb-4 ring-1 ring-coral-alert/10">
        <XCircle size={32} className="text-coral-alert" />
      </div>
      <p className="text-lg font-medium text-graphite">Error loading workspace</p>
      <p className="text-sm text-ash mt-1">{(error as Error).message}</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-graphite">Workspace</h1>
          <p className="text-sm text-ash mt-2 max-w-xl">
            {isBusiness ? "Manage your active and completed promoter partnerships." : "Manage your active and completed brand partnerships."}
          </p>
        </div>
        <div className="flex items-center gap-3">

          <Link
            to={isBusiness ? "/business/directory" : "/promoter/marketplace"}
            className="inline-flex items-center gap-2 bg-primary-600 text-white h-11 px-5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-product-card-sm"
          >
            <SearchIcon size={16} /> {isBusiness ? "Find Promoters" : "Browse Campaigns"}
          </Link>
        </div>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Active Projects</h3>
            <div className="w-8 h-8 rounded-lg bg-sky-wash text-signal-blue flex items-center justify-center"><Clock size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{activeCount}</div>
          <p className="text-xs font-semibold text-emerald-status mt-1">{activeThisWeek > 0 ? `↑ ${activeThisWeek} started this week` : 'No new projects this week'}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Completed</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-status/10 text-emerald-status flex items-center justify-center"><CheckCircle2 size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{completedCount}</div>
          <p className="text-xs text-fog font-medium mt-1">All time</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Pending Reviews</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-tag flex items-center justify-center"><Star size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{pendingReviewCount}</div>
          <p className="text-xs text-fog font-medium mt-1">Awaiting your feedback</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-fog uppercase tracking-widest">Total Value</h3>
            <div className="w-8 h-8 rounded-lg bg-sky-wash text-signal-blue flex items-center justify-center"><Wallet size={14}/></div>
          </div>
          <div className="text-2xl font-bold text-graphite">{formatNepaliCurrency(totalEarnings)}</div>
          <p className="text-xs font-semibold text-emerald-status mt-1">From completed projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN (12 cols) */}
        <div className="xl:col-span-12 space-y-6">
          
          {/* 3. FILTER TOOLBAR */}
          <div className="sticky top-0 z-30 bg-linen-canvas/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="bg-white p-2 rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog" />
                  <input
                    type="text"
                    placeholder="Search projects by name or partner..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full h-12 pl-11 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-gray-400 text-graphite"
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
                      : 'bg-white text-ash border-slate-custom/10 hover:bg-linen-canvas'
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
            <div className="bg-white rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-linen-canvas rounded-full flex items-center justify-center text-gray-300 mb-4"><Briefcase size={32}/></div>
              <h2 className="text-xl font-bold text-graphite mb-2">No active projects</h2>
              <p className="text-sm text-ash max-w-sm mb-6">You don't have any collaborations right now. Start by finding new partners.</p>
              <Link to={isBusiness ? "/business/directory" : "/promoter/marketplace"} className="h-11 px-6 flex items-center justify-center rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-product-card-sm">
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
                    className="bg-white rounded-2xl shadow-product-card-sm ring-1 ring-gray-200 hover:shadow-product-card-product-card hover:ring-primary-200 transition-all group flex flex-col overflow-hidden"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      
                      {/* Top Row */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-linen-canvas border border-slate-custom/10 flex items-center justify-center flex-shrink-0 text-lg font-bold text-graphite">
                            {c.partner_avatar_url ? (
                              <img src={c.partner_avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              c.partner_name?.slice(0, 2).toUpperCase() || "??"
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-graphite truncate pr-2">{c.campaign_title}</h3>
                            <p className="text-sm text-ash flex items-center gap-1.5 truncate mt-0.5">
                              {isBusiness ? <UserCheck size={14}/> : <Building2 size={14}/>} {c.partner_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isActive ? 'bg-sky-wash text-blue-700 border border-blue-100' :
                            isCompleted ? 'bg-emerald-status/10 text-emerald-status border border-emerald-100' :
                            'bg-linen-canvas text-ash border border-slate-custom/10'
                          }`}>
                            {c.status}
                          </span>
                          <CardMenu collab={c} isBusiness={isBusiness} onComplete={handleComplete} onReview={setReviewingCollabId} onOpenChat={() => handleOpenChat(c.id)} />
                        </div>
                      </div>

                      {/* Financials & Dates */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-linen-canvas rounded-xl p-3 border border-slate-custom/10">
                          <p className="text-[11px] font-bold text-fog uppercase tracking-widest mb-1">Budget</p>
                          <p className="text-sm font-bold text-graphite">{formatNepaliCurrency(c.campaign_budget)}</p>
                        </div>
                        <div className="bg-linen-canvas rounded-xl p-3 border border-slate-custom/10">
                          <p className="text-[11px] font-bold text-fog uppercase tracking-widest mb-1">Timeline</p>
                          <p className="text-sm font-bold text-graphite">
                            {isCompleted ? 'Completed' : c.campaign_end_date ? `${Math.max(0, Math.ceil((new Date(c.campaign_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left` : 'Ongoing'}
                          </p>
                        </div>
                      </div>

                      {/* Project Timeline */}
                      <div className="mt-auto pt-2">
                        <div className="flex items-center justify-between text-xs font-semibold mb-2">
                          <span className="text-graphite">Project Progress</span>
                          <span className={isCompleted ? 'text-emerald-status' : 'text-signal-blue'}>
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
                        <div className="h-2 w-full bg-sky-wash rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-status/100' : 'bg-sky-wash0'}`}
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
                        <div className="flex justify-between text-[10px] font-bold text-fog uppercase tracking-widest mt-2">
                          <span className="text-graphite">Agreement</span>
                          <span className={!isCompleted ? "text-signal-blue" : "text-graphite"}>Content</span>
                          <span className={isCompleted ? "text-emerald-status" : ""}>Review</span>
                        </div>
                      </div>

                      {/* Deliverables Section */}
                      {isActive && (
                        <div className="mt-4 border-t border-slate-custom/10 pt-2">
                          <DeliverablesSection 
                            collaborationId={c.id} 
                            role={isBusiness ? "business" : "promoter"} 
                          />
                        </div>
                      )}

                    </div>

                    {/* Footer Actions */}
                    <div className="bg-linen-canvas border-t border-slate-custom/10 p-4 flex gap-3">
                      {isActive && (
                        <button onClick={() => handleComplete(c.id)} className="flex-1 h-10 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-primary-600 shadow-product-card-sm transition-colors flex items-center justify-center gap-2">
                          <CheckCircle2 size={16}/> Complete
                        </button>
                      )}
                      {isCompleted && !c.has_review && (
                        <button onClick={() => setReviewingCollabId(c.id)} className="flex-1 h-10 rounded-xl bg-white border border-slate-custom/10 text-graphite text-sm font-bold hover:bg-linen-canvas shadow-product-card-sm transition-colors flex items-center justify-center gap-2">
                          <Star size={16}/> Write Review
                        </button>
                      )}
                      {isCompleted && c.has_review && (
                        <div className="flex-1 h-10 rounded-xl bg-emerald-status/10 text-emerald-status text-sm font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 size={16}/> Reviewed
                        </div>
                      )}
                      <button onClick={() => handleOpenChat(c.id)} className="h-10 rounded-xl bg-white border border-slate-custom/10 text-graphite text-sm font-bold hover:bg-linen-canvas shadow-product-card-sm transition-colors flex items-center justify-center gap-2 flex-1">
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