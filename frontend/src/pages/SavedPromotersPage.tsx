import { useState } from "react";
import { Link } from "react-router-dom";
import { useSavedPromoters, useRemoveSavedPromoter } from "../features/discovery/api";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { StatCard, Avatar } from "../components/ui";
import {
  Search, MapPin, Users, TrendingUp, Briefcase, BadgeCheck, ArrowRight, BookmarkX,
  Star, ChevronLeft, ChevronRight, LayoutGrid, List, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ActionMenu } from "../components/promoters/SavedPromoterActionMenu";
import ProfilePreviewModal from "../components/discovery/ProfilePreviewModal";
import CompareMatrixModal from "../components/discovery/CompareMatrixModal";

export default function SavedPromotersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 ring-1 ring-red-500/10">
        <BookmarkX size={32} className="text-red-500" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading saved promoters</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
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
      onError: (e) => { notifyError(e.message); setRemoveConfirm(null); },
    });
  };

  const toggleCompare = (id: string, e: any) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Saved Promoters</h1>
          <p className="text-sm text-gray-500 mt-1.5">Manage and compare your shortlisted creators.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/business/promoters"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 h-10 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
          >
            <Search size={16} />
            Browse Promoters
          </Link>
          <Link
            to="/business/campaigns/create"
            className="inline-flex items-center gap-2 bg-primary-600 text-white h-10 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm"
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
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-2 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search saved promoters..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 h-10 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder-gray-400"
          />
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 border-t lg:border-t-0 lg:border-l border-gray-100 pt-2 lg:pt-0 lg:pl-3">
          <button className="h-9 px-3 rounded-md text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
            All Categories
          </button>
          <button className="h-9 px-3 rounded-md text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
            Sort: Newest
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1 hidden lg:block" />
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button className="w-8 h-7 rounded bg-white shadow-sm flex items-center justify-center text-gray-900">
              <LayoutGrid size={14} />
            </button>
            <button className="w-8 h-7 rounded flex items-center justify-center text-gray-500 hover:text-gray-900">
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 ring-1 ring-gray-100 shadow-sm animate-pulse flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full" />
                  <div className="flex-1 space-y-2 mt-2">
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-6" />
                <div className="mt-auto flex gap-2">
                  <div className="h-10 bg-gray-50 rounded-lg flex-1" />
                  <div className="h-10 bg-gray-50 rounded-lg w-10" />
                </div>
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5 ring-1 ring-gray-900/5">
              <BookmarkX size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No saved promoters yet</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Save promoters from the directory to quickly access them later when building your campaigns.
            </p>
            <Link
              to="/business/promoters"
              className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white rounded-lg h-10 px-6 text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Search size={16} /> Browse Promoters
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((p: any) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    onClick={() => setDrawerPromoter(p)}
                    className={`bg-white rounded-2xl p-6 ring-1 transition-all cursor-pointer flex flex-col group relative hover:z-50 ${
                      isSelected ? "ring-primary-500 shadow-md bg-primary-50/10" : "ring-gray-200 hover:ring-primary-300 shadow-sm hover:shadow-xl hover:shadow-primary-900/5"
                    }`}
                  >
                    {/* Compare Checkbox Indicator (Visible on hover or if selected) */}
                    <button
                      onClick={(e) => toggleCompare(p.id, e)}
                      className={`absolute top-4 left-4 z-20 w-5 h-5 rounded flex items-center justify-center transition-all ${
                        isSelected 
                          ? "bg-primary-600 text-white opacity-100" 
                          : "bg-white border border-gray-300 text-transparent opacity-0 group-hover:opacity-100 hover:border-primary-500"
                      }`}
                    >
                      <CheckCircle2 size={14} className={isSelected ? "opacity-100" : "opacity-0"} />
                    </button>

                    <div className="flex items-start gap-4 relative z-30 pl-6">
                      <div className="relative">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-50" />
                        ) : (
                          <Avatar initials={p.username?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={p.id?.charCodeAt(0) || 0} />
                        )}
                        {p.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center ring-2 ring-white shadow-sm">
                            <BadgeCheck size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{p.username}</h3>
                          <ActionMenu 
                            promoter={p} 
                            onRemove={handleRemove} 
                            onCompare={(id: string) => setSelectedIds(prev => prev.includes(id) ? prev : [...prev, id])}
                          />
                        </div>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1.5">
                          <MapPin size={12} className="text-gray-400" /> {p.location || "Anywhere"}
                        </p>
                        {p.niche && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-600">
                            {p.niche}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-auto pt-6 z-10">
                      <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/80 border border-gray-100 group-hover:border-primary-100 transition-colors">
                        <span className="text-sm font-bold text-gray-900">{(p.followers_count || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-gray-500 font-medium mt-0.5">Followers</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/80 border border-gray-100 group-hover:border-primary-100 transition-colors">
                        <span className="text-sm font-bold text-gray-900">{(p.engagement_rate || 0).toFixed(1)}%</span>
                        <span className="text-[10px] text-gray-500 font-medium mt-0.5">Engagement</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/80 border border-gray-100 group-hover:border-primary-100 transition-colors">
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-0.5">4.9 <Star size={10} className="text-amber-400 fill-amber-400" /></span>
                        <span className="text-[10px] text-gray-500 font-medium mt-0.5">Rating</span>
                      </div>
                    </div>

                    {/* Quick Actions Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2 z-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDrawerPromoter(p); }}
                        className="w-full bg-gray-50 text-gray-700 h-9 rounded-lg text-sm font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {data.pages > 0 && (
              <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm ring-1 ring-gray-200">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-900">{(page - 1) * 12 + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(page * 12, data.total || page * 12)}</span> of <span className="font-semibold text-gray-900">{data.total || "?"}</span> profiles
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                  {selectedIds.length}
                </div>
                <div>
                  <p className="text-sm font-semibold">Promoters selected</p>
                  <p className="text-xs text-gray-400">Select up to 4 to compare stats</p>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-700" />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary-500/20 transition-all"
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
        promoters={data?.items?.filter((p: any) => selectedIds.includes(p.id)) || []} 
      />
    </div>
  );
}
