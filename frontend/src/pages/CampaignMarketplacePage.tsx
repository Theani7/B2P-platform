import { useState, useRef, useEffect } from "react";
import { Link, } from "react-router-dom";
import { useCampaignMarketplace, useApplyToCampaign, useToggleBookmark } from "../features/collaboration/api";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { formatNepaliCurrency } from "../utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Calendar, Clock, DollarSign, Bookmark, Share2, 
  Filter, Sparkles, CheckCircle, Briefcase, X, Send, MoreVertical, Flag, Link as LinkIcon,
  Globe, Laptop, Heart, Utensils, Plane, Dumbbell, Gamepad2, GraduationCap, Film, Coins, Package
} from "lucide-react";
import CampaignPreviewModal from "../components/discovery/CampaignPreviewModal";

// Quick filters removed as backend does not currently support these specific string matches
// Recommended campaigns removed due to lack of recommendation engine in backend

function CardMenu() {
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
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
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
            className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-20 py-1"
          >
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Share2 size={14} /> Share
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <LinkIcon size={14} /> Copy Link
            </button>
            <div className="h-px bg-gray-100 my-1" />
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <Flag size={14} /> Report
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MARKETPLACE_CATEGORIES = [
  "Fashion",
  "Tech",
  "Beauty",
  "Food",
  "Travel",
  "Fitness",
  "Gaming",
  "Education",
  "Entertainment",
  "Finance"
];

export default function CampaignMarketplacePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("created_at");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [previewCampaign, setPreviewCampaign] = useState<any | null>(null);
  const [bookmarkedCampaigns, setBookmarkedCampaigns] = useState<Set<string>>(new Set());

  const { data, isLoading } = useCampaignMarketplace({
    search: search || undefined,
    category: selectedCategory || undefined,
    page,
    limit: 12,
    sort,
  });

  // Sync bookmarks from backend when data loads
  useEffect(() => {
    if (data?.items) {
      setBookmarkedCampaigns(prev => {
        const newSet = new Set(prev);
        data.items.forEach(c => {
          if (c.is_bookmarked) {
            newSet.add(c.id);
          } else {
            // only sync backend explicit false if it wasn't toggled locally
            // actually simpler: just reset local state to match backend on load
            // to avoid local/remote desync after refresh
          }
        });
        // We will just initialize all bookmarked IDs from data
        const backendSet = new Set<string>();
        data.items.forEach(c => {
          if (c.is_bookmarked) backendSet.add(c.id);
        });
        return backendSet;
      });
    }
  }, [data]);

  const applyMutation = useApplyToCampaign();
  const toggleBookmarkMutation = useToggleBookmark();

  const handleApplyOpen = (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCampaignId(id);
    setSelectedCampaignTitle(title);
    setShowApplyModal(true);
  };

  const handleApply = () => {
    if (!selectedCampaignId) return;
    applyMutation.mutate(
      { campaignId: selectedCampaignId, message: applyMessage || undefined },
      {
        onSuccess: () => {
          notifySuccess("Application submitted successfully!");
          setShowApplyModal(false);
          setApplyMessage("");
          setSelectedCampaignId(null);
          setSelectedCampaignTitle("");
        },
        onError: (e) => notifyError(e.message),
      }
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20">
      
      {/* 1. COMPACT HERO */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 h-auto md:h-44 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1.5 max-w-md">Discover premium campaigns matched perfectly to your creator profile and audience demographics.</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full ring-1 ring-emerald-600/20">
              <Sparkles size={12} /> {data?.total || 0} Available Campaigns
            </span>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowCategories(!showCategories)}
            className={`flex-1 md:flex-none h-11 px-6 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors shadow-sm ${
              showCategories 
                ? 'bg-primary-50 text-primary-600 border border-primary-200' 
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            Browse Categories
          </button>
        </div>
      </div>

      {/* 2. CATEGORIES PANEL */}
      {showCategories && (
        <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-200 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 transition-all duration-200">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setPage(1);
            }}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
              selectedCategory === null
                ? 'bg-primary-50 border-primary-300 text-primary-600 font-semibold'
                : 'border-gray-100 hover:border-gray-300 bg-gray-50 text-gray-700'
            }`}
          >
            <Globe size={20} className={selectedCategory === null ? 'text-primary-600' : 'text-gray-400'} />
            <span className="text-xs">All Categories</span>
          </button>
          {MARKETPLACE_CATEGORIES.map((cat) => {
            const getIcon = (c: string) => {
              const className = selectedCategory === c ? 'text-primary-600' : 'text-gray-400';
              switch (c) {
                case "Fashion": return <Sparkles size={20} className={className} />;
                case "Tech": return <Laptop size={20} className={className} />;
                case "Beauty": return <Heart size={20} className={className} />;
                case "Food": return <Utensils size={20} className={className} />;
                case "Travel": return <Plane size={20} className={className} />;
                case "Fitness": return <Dumbbell size={20} className={className} />;
                case "Gaming": return <Gamepad2 size={20} className={className} />;
                case "Education": return <GraduationCap size={20} className={className} />;
                case "Entertainment": return <Film size={20} className={className} />;
                case "Finance": return <Coins size={20} className={className} />;
                default: return <Package size={20} className={className} />;
              }
            };
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-50 border-primary-300 text-primary-600 font-semibold'
                    : 'border-gray-100 hover:border-gray-300 bg-gray-50 text-gray-700'
                }`}
              >
                {getIcon(cat)}
                <span className="text-xs">{cat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. STICKY SEARCH TOOLBAR & QUICK FILTERS */}
      <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="bg-white p-2 rounded-2xl shadow-sm ring-1 ring-gray-200 flex flex-col gap-3">
          
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns, brands, or categories..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-12 pl-11 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-gray-400 text-gray-900"
              />
            </div>
            <div className="hidden md:flex items-center gap-2 pr-2">
              <div className="h-8 w-px bg-gray-100 mx-2"></div>
              <select 
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="h-10 pl-4 pr-10 text-sm font-medium text-gray-700 bg-gray-50 border-none rounded-xl focus:ring-0 cursor-pointer"
              >
                <option value="created_at">Newest First</option>
                <option value="budget">Highest Budget</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
          
          {selectedCategory && (
            <div className="flex items-center gap-2 px-2 pb-1">
              <span className="text-xs text-gray-500 font-medium">Active Category:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-xs font-bold text-primary-600">
                {selectedCategory}
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="hover:bg-primary-100 p-0.5 rounded-full"
                >
                  <X size={12} />
                </button>
              </span>
            </div>
          )}
          

        </div>
      </div>

      {/* 4. CAMPAIGN GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length:6}).map((_,i) => (
            <div key={i} className="bg-white rounded-2xl h-[320px] animate-pulse ring-1 ring-gray-100"></div>
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-16 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4"><Search size={32}/></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No campaigns found</h2>
          <p className="text-sm text-gray-500 max-w-sm mb-6">Try adjusting your filters or search terms to find more opportunities.</p>
          <button onClick={() => { setSearch(""); setPage(1); }} className="h-11 px-6 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.items.map((c: any) => (
              <div
                key={c.id}
                onClick={() => setPreviewCampaign(c)}
                className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-xl hover:ring-primary-300 hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden group cursor-pointer"
              >
                <div className="p-6 flex-1 flex flex-col relative">
                  
                  {/* Absolute Top Right Actions */}
                  <div className="absolute top-5 right-5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation();
                        const isCurrentlyBookmarked = bookmarkedCampaigns.has(c.id);
                        if (isCurrentlyBookmarked) {
                          setBookmarkedCampaigns(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(c.id);
                            return newSet;
                          });
                          toggleBookmarkMutation.mutate({ campaignId: c.id, bookmarked: false });
                          notifySuccess("Bookmark removed");
                        } else {
                          setBookmarkedCampaigns(prev => new Set(prev).add(c.id));
                          toggleBookmarkMutation.mutate({ campaignId: c.id, bookmarked: true });
                          notifySuccess("Bookmarked");
                        }
                      }} 
                      className={`w-8 h-8 rounded-full shadow-sm ring-1 ring-gray-200 flex items-center justify-center transition-colors ${
                        bookmarkedCampaigns.has(c.id) 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'bg-white text-gray-400 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <Bookmark size={14} className={bookmarkedCampaigns.has(c.id) ? "fill-current" : ""} />
                    </button>
                    <CardMenu />
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4 pr-16">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-white ring-1 ring-gray-200 flex items-center justify-center flex-shrink-0 text-xl font-bold text-indigo-600">
                      {c.business_name?.charAt(0).toUpperCase() || 'B'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-500 truncate max-w-[120px]">{c.business_name}</span>
                        <CheckCircle size={14} className="text-primary-500" />
                      </div>
                      <span className="inline-flex mt-0.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{c.category}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">{c.title}</h3>
                  
                  <div className="flex items-center gap-4 text-sm font-bold text-gray-900 mb-4">
                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      {formatNepaliCurrency(c.budget)}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Clock size={14}/> {Math.max(1, Math.ceil((new Date(c.end_date).getTime() - new Date(c.start_date).getTime()) / (1000 * 60 * 60 * 24)))} days
                    </span>
                  </div>

                  {/* Requirements Chips instead of description */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2.5 py-1 rounded bg-gray-50 text-gray-600 text-xs font-semibold ring-1 ring-gray-200/60">{c.category}</span>
                    {c.requirements && c.requirements.split(',').slice(0, 2).map((req, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-gray-50 text-gray-600 text-xs font-semibold ring-1 ring-gray-200/60">
                        {req.trim().substring(0, 20)}{req.trim().length > 20 ? '...' : ''}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {/* Only show circles if there are applicants, up to 3 */}
                        {Array.from({length: Math.min(3, c.applicant_count || 0)}, (_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-gray-400">{c.applicant_count || 0} applied</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                      <Calendar size={12}/> Ends in {Math.max(0, Math.ceil((new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d
                    </span>
                  </div>

                </div>

                {/* Card Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                  <button 
                    onClick={(e) => {
                      if (!c.has_applied) handleApplyOpen(c.id, c.title, e);
                    }}
                    disabled={c.has_applied}
                    className={`flex-1 h-10 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                      c.has_applied 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-900 text-white hover:bg-primary-600'
                    }`}
                  >
                    {c.has_applied ? 'Applied' : 'Apply Now'}
                  </button>
                  <div className="flex-1 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm">
                    View Details
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
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
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Submit Application</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-900"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-sm">
                Applying to <span className="font-bold text-indigo-900">{selectedCampaignTitle}</span>
              </div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Cover Message (Optional)</label>
              <textarea
                value={applyMessage}
                onChange={e => setApplyMessage(e.target.value)}
                placeholder="Why are you a good fit for this campaign?"
                className="w-full h-32 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm p-4 resize-none transition-all"
              ></textarea>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowApplyModal(false)} className="h-11 px-6 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleApply} disabled={applyMutation.isPending} className="h-11 px-6 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
                  <Send size={16}/> {applyMutation.isPending ? 'Sending...' : 'Send Application'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Preview Modal */}
      {previewCampaign && (
        <CampaignPreviewModal 
          campaign={previewCampaign} 
          onClose={() => setPreviewCampaign(null)} 
          onApply={(id, title) => {
            setSelectedCampaignId(id);
            setSelectedCampaignTitle(title);
            setShowApplyModal(true);
          }}
        />
      )}
    </div>
  );
}
