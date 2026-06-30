import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSavedPromoters, useRemoveSavedPromoter } from "../features/discovery/api";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { getErrorMessage } from "../utils/error";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { StatCard, Avatar } from "../components/ui";
import {
  Search, MapPin, Users, TrendingUp, BadgeCheck, ArrowRight, BookmarkX,
  Star, ChevronLeft, ChevronRight, LayoutGrid, List, CheckCircle2, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ActionMenu } from "../components/promoters/SavedPromoterActionMenu";
import { formatCompactNumber } from "../utils/number";
import ProfilePreviewModal from "../components/discovery/ProfilePreviewModal";
import CompareMatrixModal from "../components/discovery/CompareMatrixModal";

const NICHE_OPTIONS = ["LIFESTYLE", "TECH", "FASHION", "FOOD", "TRAVEL", "FITNESS", "GAMING", "BUSINESS"];

export default function SavedPromotersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [nicheFilter, setNicheFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerPromoter, setDrawerPromoter] = useState<any>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  
  const { data, isLoading, error } = useSavedPromoters({
    search: search || undefined,
    page,
    limit: 12,
  });

  const removeSaved = useRemoveSavedPromoter();
  const [removeConfirm, setRemoveConfirm] = useState<{ id: string; username: string } | null>(null);

  const filteredPromoters = useMemo(() => {
    if (!data?.items) return [];
    let items = [...data.items];
    
    if (nicheFilter) {
      items = items.filter((p: any) => p.niche === nicheFilter);
    }
    
    if (sortFilter === "followers") {
      items.sort((a: any, b: any) => (b.followers_count || 0) - (a.followers_count || 0));
    } else if (sortFilter === "engagement") {
      items.sort((a: any, b: any) => (b.engagement_rate || 0) - (a.engagement_rate || 0));
    } else {
      items.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
    
    return items;
  }, [data?.items, nicheFilter, sortFilter]);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-cards bg-coral-alert/10 flex items-center justify-center mb-4">
        <BookmarkX size={32} className="text-coral-alert" />
      </div>
      <p className="text-lg font-medium text-graphite">Error loading saved promoters</p>
      <p className="text-sm text-ash mt-1">{(error as Error).message}</p>
    </div>
  );

  const handleRemove = (id: string, username: string) => {
    setRemoveConfirm({ id, username });
    if (drawerPromoter && drawerPromoter.id === id) {
      setDrawerPromoter(null);
    }
  };

  const confirmRemove = () => {
    if (!removeConfirm) return;
    removeSaved.mutate(removeConfirm.id, {
      onSuccess: () => { 
        notifySuccess(`${removeConfirm.username} removed from shortlist`); 
        setRemoveConfirm(null);
        setSelectedIds(prev => prev.filter(pid => pid !== removeConfirm.id));
      },
      onError: (e) => { notifyError(getErrorMessage(e)); setRemoveConfirm(null); },
    });
  };

  const toggleCompare = (id: string, e: any) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setNicheFilter("");
    setSortFilter("newest");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-heading-lg text-graphite tracking-tight">Saved Promoters</h1>
          <p className="text-sm text-ash mt-1.5">Manage and compare your shortlisted creators.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/business/promoters"
            className="inline-flex items-center gap-2 bg-white border border-slate-custom/10 text-graphite h-10 px-4 rounded-inputs text-sm font-medium hover:bg-sky-wash transition-all shadow-product-card-sm"
          >
            <Search size={16} />
            Browse Promoters
          </Link>
          <Link
            to="/business/campaigns/create"
            className="inline-flex items-center gap-2 bg-signal-blue text-white h-10 px-4 rounded-inputs text-sm font-medium hover:opacity-90 transition-all shadow-product-card-sm"
          >
            <ArrowRight size={16} />
            Post Campaign
          </Link>
        </div>
      </div>

      {/* Stats Layer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Saved Promoters" value={data?.total ?? "—"} icon={Users} trend={{ value: "4%", positive: true }} subtitle="vs last month" />
        <StatCard label="Verified Promoters" value={data?.total ? Math.floor(data.total * 0.6) : "—"} icon={BadgeCheck} />
        <StatCard label="Average Engagement" value="5.2%" icon={TrendingUp} trend={{ value: "0.2%", positive: true }} subtitle="vs last month" />
        <StatCard label="Combined Followers" value="1.2M" icon={Users} trend={{ value: "120K", positive: true }} subtitle="vs last month" />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-cards shadow-product-card-product-card border border-slate-custom/10 p-2 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" />
          <input
            type="text"
            placeholder="Search saved promoters..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 h-10 bg-transparent border-none focus:ring-0 text-sm text-graphite placeholder-fog"
          />
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-custom/10 pt-2 lg:pt-0 lg:pl-3">
          <select
            value={nicheFilter}
            onChange={(e) => { setNicheFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-inputs text-xs font-medium text-graphite bg-white border border-slate-custom/10 hover:bg-sky-wash transition-colors cursor-pointer"
          >
            <option value="">All Categories</option>
            {NICHE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <select
            value={sortFilter}
            onChange={(e) => { setSortFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-inputs text-xs font-medium text-graphite bg-white border border-slate-custom/10 hover:bg-sky-wash transition-colors cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="followers">Most Followers</option>
            <option value="engagement">Highest Engagement</option>
          </select>
        </div>
      </div>

      {/* Grid Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-cards-lg p-6 shadow-product-card animate-pulse flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-sky-wash rounded-full" />
                  <div className="flex-1 space-y-2 mt-2">
                    <div className="h-4 bg-sky-wash rounded w-1/2" />
                    <div className="h-3 bg-sky-wash rounded w-1/3" />
                  </div>
                </div>
                <div className="h-3 bg-sky-wash rounded w-full mb-2" />
                <div className="h-3 bg-sky-wash rounded w-3/4 mb-6" />
                <div className="mt-auto flex gap-2">
                  <div className="h-10 bg-linen-canvas rounded-inputs flex-1" />
                  <div className="h-10 bg-linen-canvas rounded-inputs w-10" />
                </div>
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-cards-lg shadow-product-card border border-slate-custom/10">
            <div className="w-20 h-20 rounded-full bg-linen-canvas flex items-center justify-center mb-5 shadow-product-card-sm border border-slate-custom/10">
              <BookmarkX size={32} className="text-ash" />
            </div>
            <h3 className="text-heading text-graphite">No saved promoters yet</h3>
            <p className="text-sm text-ash mt-2 max-w-md">
              Save promoters from the directory to quickly access them later when building your campaigns.
            </p>
            <Link
              to="/business/promoters"
              className="mt-6 inline-flex items-center gap-2 bg-signal-blue text-white rounded-inputs h-10 px-6 text-sm font-medium hover:opacity-90 transition-colors shadow-product-card-sm"
            >
              <Search size={16} /> Browse Promoters
            </Link>
          </div>
        ) : filteredPromoters.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-cards-lg shadow-product-card border border-slate-custom/10">
            <div className="w-20 h-20 rounded-full bg-linen-canvas flex items-center justify-center mb-5 shadow-product-card-sm border border-slate-custom/10">
              <Filter size={32} className="text-ash" />
            </div>
            <h3 className="text-heading text-graphite">No results found</h3>
            <p className="text-sm text-ash mt-2 max-w-md">
              No saved promoters match your current filters. Try adjusting your search or category filter.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 inline-flex items-center gap-2 bg-sky-wash text-graphite rounded-inputs h-10 px-6 text-sm font-medium hover:bg-slate-custom/5 transition-colors shadow-product-card-sm"
            >
              <Filter size={16} /> Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromoters.map((p: any) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    onClick={() => setDrawerPromoter(p)}
                    className={`bg-white rounded-cards-lg p-6 shadow-product-card border transition-all cursor-pointer flex flex-col group relative hover:z-50 overflow-hidden ${
                      isSelected ? "border-signal-blue shadow-product-card-md bg-signal-blue/5" : "border-slate-custom/10 hover:border-signal-blue/20 shadow-product-card-sm"
                    }`}
                  >
                    {/* Compare Checkbox Indicator (Visible on hover or if selected) */}
                    <button
                      onClick={(e) => toggleCompare(p.id, e)}
                      className={`absolute top-4 left-4 z-20 w-5 h-5 rounded flex items-center justify-center transition-all ${
                        isSelected 
                          ? "bg-signal-blue text-white opacity-100" 
                          : "bg-white border border-slate-custom/10 text-transparent opacity-0 group-hover:opacity-100 hover:border-signal-blue"
                      }`}
                    >
                      <CheckCircle2 size={14} className={isSelected ? "opacity-100" : "opacity-0"} />
                    </button>

                    <div className="flex items-start gap-4 relative z-30 pl-6">
                      <div className="relative">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover shadow-product-card-sm border border-slate-custom/10" />
                        ) : (
                          <Avatar initials={p.username?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={p.id?.charCodeAt(0) || 0} />
                        )}
                        {p.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-signal-blue flex items-center justify-center ring-2 ring-white shadow-product-card-sm">
                            <BadgeCheck size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-graphite truncate group-hover:text-signal-blue transition-colors">{p.username}</h3>
                          <ActionMenu 
                            promoter={p} 
                            onRemove={handleRemove} 
                            onCompare={(id: string) => setSelectedIds(prev => prev.includes(id) ? prev : [...prev, id])}
                          />
                        </div>
                        <p className="text-xs text-ash truncate flex items-center gap-1.5">
                          <MapPin size={12} className="text-fog" /> {p.location || "Anywhere"}
                        </p>
                        {p.niche && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-inputs text-[10px] font-bold tracking-wider uppercase bg-sky-wash text-graphite">
                            {p.niche}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-auto pt-6 z-10">
                      <div className="flex flex-col items-center p-2 rounded-inputs bg-linen-canvas/80 border border-slate-custom/10 group-hover:border-signal-blue/20 transition-colors">
                        <span className="text-sm font-bold text-graphite">{formatCompactNumber(p.followers_count)}</span>
                        <span className="text-[10px] text-ash font-medium mt-0.5">Followers</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-inputs bg-linen-canvas/80 border border-slate-custom/10 group-hover:border-signal-blue/20 transition-colors">
                        <span className="text-sm font-bold text-graphite">{(p.engagement_rate || 0).toFixed(1)}%</span>
                        <span className="text-[10px] text-ash font-medium mt-0.5">Engagement</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-inputs bg-linen-canvas/80 border border-slate-custom/10 group-hover:border-signal-blue/20 transition-colors">
                        <span className="text-sm font-bold text-graphite flex items-center gap-0.5">{p.average_rating ? p.average_rating.toFixed(1) : "0.0"} <Star size={10} className="text-amber-400 fill-amber-400" /></span>
                        <span className="text-[10px] text-ash font-medium mt-0.5">Rating</span>
                      </div>
                    </div>

                    {/* Quick Actions Footer */}
                    <div className="mt-auto pt-4 border-t border-slate-custom/10 flex gap-2 z-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDrawerPromoter(p); }}
                        className="w-full bg-linen-canvas text-graphite h-9 rounded-inputs text-sm font-medium hover:bg-sky-wash transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {data.pages > 0 && (
              <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-cards shadow-product-card border border-slate-custom/10">
                <p className="text-sm text-ash">
                  Showing <span className="font-semibold text-graphite">{(page - 1) * 12 + 1}</span> to <span className="font-semibold text-graphite">{Math.min(page * 12, data.total || page * 12)}</span> of <span className="font-semibold text-graphite">{data.total || "?"}</span> profiles
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-inputs border border-slate-custom/10 text-ash hover:bg-sky-wash disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="p-2 rounded-inputs border border-slate-custom/10 text-ash hover:bg-sky-wash disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-graphite text-white px-6 py-4 rounded-cards-lg shadow-product-card-product-card flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-signal-blue/20 flex items-center justify-center text-signal-blue font-bold">
                  {selectedIds.length}
                </div>
                <div>
                  <p className="text-sm font-semibold">Promoters selected</p>
                  <p className="text-xs text-ash">Select up to 4 to compare stats</p>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-700" />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-4 py-2 text-sm font-medium text-ash hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-6 py-2 bg-signal-blue hover:bg-signal-blue/80 text-white rounded-inputs text-sm font-semibold transition-colors"
                >
                  Compare Profiles
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfilePreviewModal 
        isOpen={!!drawerPromoter} 
        onClose={() => setDrawerPromoter(null)} 
        promoter={drawerPromoter}
        isSaved={true}
        onSave={(id: string) => handleRemove(id, drawerPromoter?.username || "Promoter")}
      />

      <ConfirmDialog
        isOpen={!!removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        onConfirm={confirmRemove}
        title="Remove Promoter"
        message={removeConfirm ? `Remove ${removeConfirm.username} from your shortlist?` : ""}
      />

      <CompareMatrixModal 
        isOpen={isCompareModalOpen} 
        onClose={() => setIsCompareModalOpen(false)} 
        promoters={filteredPromoters.filter((p: any) => selectedIds.includes(p.id)) || []} 
      />
    </div>
  );
}
