import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePromoterDirectory, useSavePromoter, useRemoveSavedPromoter, useSavedPromoters } from "../features/discovery/api";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { getErrorMessage } from "../utils/error";
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
        onError: (err: any) => notifyError(getErrorMessage(err)),
      });
    } else {
      savePromoter.mutate(id, {
        onSuccess: () => notifySuccess("Promoter saved to shortlist!"),
onError: (err: any) => {
          if (err.response?.status === 409) {
            notifyError("Promoter is already saved.");
          } else {
            notifyError(getErrorMessage(err));
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
          <h1 className="text-heading-lg text-graphite tracking-tight">Discover Promoters</h1>
          <p className="text-sm text-ash mt-1.5">Find the perfect creators to elevate your next marketing campaign.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/business/saved-promoters"
            className="inline-flex items-center gap-2 bg-white border border-slate-custom/10 text-graphite h-10 px-4 rounded-inputs text-sm font-medium hover:bg-sky-wash transition-all shadow-product-card-sm"
          >
            <Bookmark size={16} />
            Saved Profiles
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
        <StatCard label="Available Promoters" value={data?.total ? data.total.toLocaleString() : "—"} icon={Users} trend={{ value: "12%", positive: true }} subtitle="vs last month" />
        <StatCard label="Verified Creators" value={data?.total ? Math.floor(data.total * 0.4).toLocaleString() : "—"} icon={BadgeCheck} />
        <StatCard label="Avg Engagement" value="4.8%" icon={TrendingUp} trend={{ value: "0.5%", positive: true }} subtitle="vs last month" />
        <StatCard label="Active Campaigns" value="124" icon={CheckCircle2} />
      </div>

      {/* Modern Filter Toolbar */}
      <div className="bg-white rounded-cards shadow-product-card-product-card border border-slate-custom/10 p-2 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" />
          <input
            type="text"
            placeholder="Search promoters by name, niche, or location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 h-10 bg-transparent border-none focus:ring-0 text-sm text-graphite placeholder-fog"
          />
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-custom/10 pt-2 lg:pt-0 lg:pl-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => { setVerified(verified ? undefined : true); setPage(1); }}
              className={`whitespace-nowrap px-3 h-8 rounded-pill text-xs font-semibold tracking-wide transition-colors border ${
                verified ? "bg-sky-wash border-signal-blue text-signal-blue" : "bg-white border-slate-custom/10 text-ash hover:bg-sky-wash"
              }`}
            >
              Verified Only
            </button>
            {NICHE_OPTIONS.slice(0, 4).map((n) => (
              <button
                key={n}
                onClick={() => { setNiche(niche === n ? "" : n); setPage(1); }}
                className={`whitespace-nowrap px-3 h-8 rounded-pill text-xs font-semibold tracking-wide transition-colors border ${
                  niche === n ? "bg-sky-wash border-signal-blue text-signal-blue" : "bg-white border-slate-custom/10 text-ash hover:bg-sky-wash"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="appearance-none h-8 px-3 ml-auto rounded-inputs border border-slate-custom/10 bg-linen-canvas text-xs font-medium text-graphite focus:outline-none focus:ring-signal-blue/10 cursor-pointer"
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
                <div className="mt-auto grid grid-cols-3 gap-2">
                  <div className="h-12 bg-linen-canvas rounded-inputs" />
                  <div className="h-12 bg-linen-canvas rounded-inputs" />
                  <div className="h-12 bg-linen-canvas rounded-inputs" />
                </div>
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-cards-lg shadow-product-card-product-card border border-slate-custom/10">
            <div className="w-20 h-20 rounded-full bg-linen-canvas flex items-center justify-center mb-5 shadow-product-card-sm border border-slate-custom/10">
              <Search size={32} className="text-ash" />
            </div>
            <h3 className="text-heading text-graphite">No creators found</h3>
            <p className="text-sm text-ash mt-2 max-w-md">
              We couldn't find any promoters matching your current filters. Try broadening your search criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 bg-graphite text-white rounded-inputs h-10 px-6 text-sm font-medium hover:bg-graphite/80 transition-colors shadow-product-card-sm"
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
                  className="bg-white rounded-cards-lg p-6 shadow-product-card border border-slate-custom/10 hover:shadow-product-card-hover transition-all cursor-pointer flex flex-col group relative overflow-hidden"
                >
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="relative">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover shadow-product-card-sm border border-slate-custom/10" />
                      ) : (
                        <Avatar initials={p.username?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={p.id?.charCodeAt(0) || 0} />
                      )}
                      {p.verified && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-signal-blue flex items-center justify-center ring-2 ring-white shadow-product-card-sm">
                          <BadgeCheck size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-graphite truncate group-hover:text-signal-blue transition-colors">{p.username}</h3>
                        <button 
                          onClick={(e) => handleSave(p.id, e)}
                          className={savedPromoterIds.has(p.id) ? "text-signal-blue hover:text-signal-blue/80 transition-colors" : "text-ash hover:text-signal-blue transition-colors"}
                        >
                          <Bookmark size={18} className={savedPromoterIds.has(p.id) ? "fill-current" : ""} />
                        </button>
                      </div>
                      <p className="text-xs text-ash mt-0.5 truncate flex items-center gap-1.5">
                        <MapPin size={12} className="text-fog" /> {p.location || "Anywhere"}
                      </p>
                      {p.niche && (
                        <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-inputs text-[10px] font-bold tracking-wider uppercase bg-sky-wash text-graphite">
                          {p.niche}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-5 text-sm text-graphite line-clamp-2 leading-relaxed z-10">
                    {p.bio || p.headline || "A talented creator producing engaging content for their growing audience."}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-auto pt-6 z-10">
                    <div className="flex flex-col items-center p-2 rounded-inputs bg-linen-canvas/80 border border-slate-custom/10 group-hover:border-signal-blue/20 transition-colors">
                      <span className="text-sm font-bold text-graphite">{(p.followers_count || 0).toLocaleString()}</span>
                      <span className="text-[10px] text-ash font-medium mt-0.5">Followers</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-inputs bg-linen-canvas/80 border border-slate-custom/10 group-hover:border-signal-blue/20 transition-colors">
                      <span className="text-sm font-bold text-graphite">{(p.engagement_rate || 0).toFixed(1)}%</span>
                      <span className="text-[10px] text-ash font-medium mt-0.5">Engagement</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-inputs bg-linen-canvas/80 border border-slate-custom/10 group-hover:border-signal-blue/20 transition-colors">
                      <span className="text-sm font-bold text-graphite flex items-center gap-0.5">4.9 <Star size={10} className="text-amber-400 fill-amber-400" /></span>
                      <span className="text-[10px] text-ash font-medium mt-0.5">Rating</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-custom/10 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDrawerPromoter(p); }}
                      className="flex-1 h-11 bg-white border border-slate-custom/10 text-graphite rounded-inputs text-sm font-semibold hover:bg-sky-wash transition-colors focus:ring-2 focus:ring-signal-blue focus:outline-none"
                    >
                      View Profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {data.pages > 0 && (
              <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-cards shadow-product-card-product-card border border-slate-custom/10">
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
