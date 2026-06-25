import { useState } from "react";
import { Link } from "react-router-dom";
import { usePromoterDirectory, useSavePromoter } from "../features/discovery/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";
import {
  Search,
  Users,
  MapPin,
  TrendingUp,
  Eye,
  Bookmark,
  BadgeCheck,
  Briefcase,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  X,
} from "lucide-react";

const NICHE_OPTIONS = ["LIFESTYLE", "TECH", "FASHION", "FOOD", "TRAVEL", "FITNESS", "GAMING", "BUSINESS", "OTHER"];
const FOLLOWER_RANGES = [
  { label: "0 - 1k", min: 0, max: 1000 },
  { label: "1k - 10k", min: 1000, max: 10000 },
  { label: "10k - 50k", min: 10000, max: 50000 },
  { label: "50k - 100k", min: 50000, max: 100000 },
  { label: "100k+", min: 100000, max: undefined },
];
const EXPERIENCE_RANGES = [
  { label: "0 - 1 years", min: 0, max: 1 },
  { label: "1 - 3 years", min: 1, max: 3 },
  { label: "3 - 5 years", min: 3, max: 5 },
  { label: "5+ years", min: 5, max: undefined },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "followers_count", label: "Followers" },
  { value: "engagement_rate", label: "Engagement Rate" },
  { value: "years_experience", label: "Experience" },
  { value: "username", label: "Username" },
];

export default function PromoterDirectoryPage() {
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [verified, setVerified] = useState<boolean | undefined>(undefined);
  const [followersMin, setFollowersMin] = useState<number | undefined>(undefined);
  const [followersMax, setFollowersMax] = useState<number | undefined>(undefined);
  const [experienceMin, setExperienceMin] = useState<number | undefined>(undefined);
  const [experienceMax, setExperienceMax] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = usePromoterDirectory({
    search: search || undefined,
    niche: niche || undefined,
    location: location || undefined,
    verified: verified,
    followers_min: followersMin,
    followers_max: followersMax,
    experience_min: experienceMin,
    experience_max: experienceMax,
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit: 12,
  });

  const savePromoter = useSavePromoter();

  const handleSave = (id: string) => {
    savePromoter.mutate(id, {
      onSuccess: () => notifySuccess("Promoter saved to shortlist!"),
      onError: (e) => notifyError(e.message),
    });
  };

  const handleFollowerRange = (min?: number, max?: number) => {
    setFollowersMin(min);
    setFollowersMax(max);
    setPage(1);
  };

  const handleExperienceRange = (min?: number, max?: number) => {
    setExperienceMin(min);
    setExperienceMax(max);
    setPage(1);
  };

  const clearFilters = () => {
    setNiche("");
    setLocation("");
    setVerified(undefined);
    setFollowersMin(undefined);
    setFollowersMax(undefined);
    setExperienceMin(undefined);
    setExperienceMax(undefined);
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters = niche || location || verified !== undefined || followersMin !== undefined || experienceMin !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-brand-teal p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-white">Discover Promoters</h1>
              <p className="text-sm text-white/70 mt-0.5">Find the perfect collaborators for your campaigns</p>
            </div>
          </div>
          <Link
            to="/business/saved-promoters"
            className="bg-white/10 border border-white/20 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
          >
            <Bookmark size={16} />
            Saved ({data?.total || 0})
          </Link>
        </div>
      </div>

      {/* Search & Filters Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, niche, or location..."
            aria-label="Search promoters"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          className="appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
            showFilters || hasActiveFilters
              ? "bg-brand-purple-50 border-brand-purple/30 text-brand-purple"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-brand-purple" />
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Filter size={14} className="text-brand-purple" />
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-brand-coral hover:text-brand-coral-900 flex items-center gap-1 font-medium"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Niche</label>
              <select
                value={niche}
                onChange={(e) => { setNiche(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              >
                <option value="">All Niches</option>
                {NICHE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Location</label>
              <input
                type="text"
                placeholder="Anywhere"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Followers</label>
              <select
                value={followersMin !== undefined ? `${followersMin}-${followersMax || ""}` : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) { setFollowersMin(undefined); setFollowersMax(undefined); }
                  else {
                    const [min, max] = val.split("-");
                    handleFollowerRange(Number(min), max ? Number(max) : undefined);
                  }
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              >
                <option value="">Any</option>
                {FOLLOWER_RANGES.map((r) => (
                  <option key={r.label} value={`${r.min}-${r.max || ""}`}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Experience</label>
              <select
                value={experienceMin !== undefined ? `${experienceMin}-${experienceMax || ""}` : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) { setExperienceMin(undefined); setExperienceMax(undefined); }
                  else {
                    const [min, max] = val.split("-");
                    handleExperienceRange(Number(min), max ? Number(max) : undefined);
                  }
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              >
                <option value="">Any</option>
                {EXPERIENCE_RANGES.map((r) => (
                  <option key={r.label} value={`${r.min}-${r.max || ""}`}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verified === true}
                onChange={(e) => { setVerified(e.target.checked ? true : undefined); setPage(1); }}
                className="w-4 h-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
              />
              <span className="text-sm text-gray-600">Verified only</span>
            </label>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No promoters found"
          description="Try adjusting your search or filters to find more promoters."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((p: any) => (
              <div
                key={p.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple-50 to-brand-indigo-50 flex items-center justify-center text-xl font-bold text-brand-purple-900 ring-1 ring-brand-purple/10 overflow-hidden">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          p.username?.[0]?.toUpperCase() ?? "?"
                        )}
                      </div>
                      {p.verified && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-teal flex items-center justify-center ring-2 ring-white">
                          <BadgeCheck size={12} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/promoters/${p.username}`}
                          className="truncate font-medium text-gray-900 hover:text-brand-purple transition-colors"
                        >
                          {p.username}
                        </Link>
                        {p.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-teal-50 text-brand-teal-900 ring-1 ring-brand-teal/10 flex-shrink-0">
                            <BadgeCheck size={10} />
                            Verified
                          </span>
                        )}
                      </div>
                      {p.headline && (
                        <p className="truncate text-sm text-gray-500 mt-0.5">{p.headline}</p>
                      )}

                      {/* Stats */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg ring-1 ring-gray-100">
                          <Briefcase size={10} className="text-brand-purple" />
                          {p.niche}
                        </span>
                        {p.location && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                            <MapPin size={10} className="text-gray-400" />
                            {p.location}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Users size={11} className="text-gray-400" />
                          {p.followers_count?.toLocaleString()} followers
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp size={11} className="text-brand-teal" />
                          {p.engagement_rate?.toFixed(1)}% eng.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2 pt-4 border-t border-gray-50">
                    <Link
                      to={`/promoters/${p.username}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-purple hover:border-brand-purple/30 transition-all"
                    >
                      <Eye size={14} />
                      Profile
                    </Link>
                    <button
                      onClick={() => handleSave(p.id)}
                      disabled={savePromoter.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-purple text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Bookmark size={14} />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <ArrowRight size={14} className="rotate-180" />
                Previous
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? "bg-brand-purple text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page >= data.pages}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Next
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
