import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePromoterDirectory, useSavePromoter, useRemoveSavedPromoter, useSavedPromoters } from "../features/discovery/api";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { StatCard, Avatar } from "../components/ui";
import {
  Search, Users, MapPin, TrendingUp, Bookmark, BadgeCheck,
  Briefcase, ArrowRight, Star, X, Image as ImageIcon,
  ChevronLeft, ChevronRight, CheckCircle2, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfilePreviewModal from "../components/discovery/ProfilePreviewModal";
const NICHE_OPTIONS = ["LIFESTYLE", "TECH", "FASHION", "FOOD", "TRAVEL", "FITNESS", "GAMING", "BUSINESS"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest Profiles" },
  { value: "followers_count", label: "Most Followers" },
  { value: "engagement_rate", label: "Highest Engagement" },
  { value: "years_experience", label: "Most Experienced" },
];


export default function PromoterDirectoryPage() {
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("");
  const [verified, setVerified] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState("followers_count");
  const [page, setPage] = useState(1);
  const [drawerPromoter, setDrawerPromoter] = useState<any>(null);

  const { data, isLoading } = usePromoterDirectory({
    search: search || undefined,
    niche: niche || undefined,
    verified,
    sort_by: sortBy,
    sort_order: "desc",
    page,
    limit: 12,
  });

  const { data: savedData } = useSavedPromoters({ limit: 100 });
  const savedPromoterIds = new Set(savedData?.items?.map((p: any) => p.id) || []);

  const savePromoter = useSavePromoter();
  const removePromoter = useRemoveSavedPromoter();

  const handleSave = (id: string, e?: any) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (savedPromoterIds.has(id)) {
      removePromoter.mutate(id, {
        onSuccess: () => notifySuccess("Promoter removed from shortlist"),
        onError: (err: any) => notifyError(err.message),
      });
    } else {
      savePromoter.mutate(id, {
        onSuccess: () => notifySuccess("Promoter saved to shortlist!"),
        onError: (err: any) => {
          if (err.response?.status === 409) {
            notifyError("Promoter is already saved.");
          } else {
            notifyError(err.message || "Failed to save promoter.");
          }
        },
      });
    }
  };

  const clearFilters = () => {
    setNiche("");
    setVerified(undefined);
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters = niche || verified !== undefined || search !== "";

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Discover Promoters</h1>
          <p className="text-sm text-gray-500 mt-1.5">Find the perfect creators to elevate your next marketing campaign.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/business/saved-promoters"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 h-10 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
          >
            <Bookmark size={16} />
            Saved Profiles
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
        <StatCard label="Available Promoters" value={data?.total ? data.total.toLocaleString() : "—"} icon={Users} trend={{ value: "12%", positive: true }} subtitle="vs last month" />
        <StatCard label="Verified Creators" value={data?.total ? Math.floor(data.total * 0.4).toLocaleString() : "—"} icon={BadgeCheck} />
        <StatCard label="Avg Engagement" value="4.8%" icon={TrendingUp} trend={{ value: "0.5%", positive: true }} subtitle="vs last month" />
        <StatCard label="Active Campaigns" value="124" icon={CheckCircle2} />
      </div>

      {/* Modern Filter Toolbar */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-2 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search promoters by name, niche, or location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 h-10 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder-gray-400"
          />
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 border-t lg:border-t-0 lg:border-l border-gray-100 pt-2 lg:pt-0 lg:pl-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => { setVerified(verified ? undefined : true); setPage(1); }}
              className={`whitespace-nowrap px-3 h-8 rounded-full text-xs font-semibold tracking-wide transition-colors border ${
                verified ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Verified Only
            </button>
            {NICHE_OPTIONS.slice(0, 4).map((n) => (
              <button
                key={n}
                onClick={() => { setNiche(niche === n ? "" : n); setPage(1); }}
                className={`whitespace-nowrap px-3 h-8 rounded-full text-xs font-semibold tracking-wide transition-colors border ${
                  niche === n ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="appearance-none h-8 px-3 ml-auto rounded-md border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
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
                <div className="mt-auto grid grid-cols-3 gap-2">
                  <div className="h-12 bg-gray-50 rounded-lg" />
                  <div className="h-12 bg-gray-50 rounded-lg" />
                  <div className="h-12 bg-gray-50 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5 ring-1 ring-gray-900/5">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No creators found</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              We couldn't find any promoters matching your current filters. Try broadening your search criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 bg-gray-900 text-white rounded-lg h-10 px-6 text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                <X size={16} /> Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((p: any) => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  onClick={() => setDrawerPromoter(p)}
                  className="bg-white rounded-2xl p-6 ring-1 ring-gray-200 hover:ring-primary-300 shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all cursor-pointer flex flex-col group relative overflow-hidden"
                >
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="relative">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-50" />
                      ) : (
                        <Avatar initials={p.username?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={p.id?.charCodeAt(0) || 0} />
                      )}
                      {p.verified && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center ring-2 ring-white shadow-sm">
                          <BadgeCheck size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{p.username}</h3>
                        <button 
                          onClick={(e) => handleSave(p.id, e)}
                          className={savedPromoterIds.has(p.id) ? "text-primary-600 hover:text-primary-700 transition-colors" : "text-gray-300 hover:text-primary-500 transition-colors"}
                        >
                          <Bookmark size={18} className={savedPromoterIds.has(p.id) ? "fill-current" : ""} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400" /> {p.location || "Anywhere"}
                      </p>
                      {p.niche && (
                        <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-600">
                          {p.niche}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-5 text-sm text-gray-600 line-clamp-2 leading-relaxed z-10">
                    {p.bio || p.headline || "A talented creator producing engaging content for their growing audience."}
                  </p>

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

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDrawerPromoter(p); }}
                      className="flex-1 h-11 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      View Profile
                    </button>
                  </div>
                </motion.div>
              ))}
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

      <ProfilePreviewModal 
        isOpen={!!drawerPromoter} 
        onClose={() => setDrawerPromoter(null)} 
        promoter={drawerPromoter}
        isSaved={drawerPromoter ? savedPromoterIds.has(drawerPromoter.id) : false}
        onSave={(id: string) => { handleSave(id); }}
      />
    </div>
  );
}
