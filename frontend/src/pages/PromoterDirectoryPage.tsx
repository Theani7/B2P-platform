import { useState } from "react";
import { Link } from "react-router-dom";
import { usePromoterDirectory, useSavePromoter } from "../features/discovery/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader, Avatar } from "../components/ui";
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
      <PageHeader
        title="Discover Promoters"
        description="Find the perfect collaborators for your campaigns"
        actions={
          <Link
            to="/business/saved-promoters"
            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Bookmark size={16} />
            Saved ({data?.total || 0})
          </Link>
        }
      />

      {/* Search & Filters Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, niche, or location..."
            aria-label="Search promoters"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? "bg-brand-purple-50 border-brand-purple/20 text-brand-purple-900"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo" />
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
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
              <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1.5">Niche</label>
              <select
                value={niche}
                onChange={(e) => { setNiche(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
              >
                <option value="">All Niches</option>
                {NICHE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1.5">Location</label>
              <input
                type="text"
                placeholder="Anywhere"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1.5">Followers</label>
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
              >
                <option value="">Any</option>
                {FOLLOWER_RANGES.map((r) => (
                  <option key={r.label} value={`${r.min}-${r.max || ""}`}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1.5">Experience</label>
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
              >
                <option value="">Any</option>
                {EXPERIENCE_RANGES.map((r) => (
                  <option key={r.label} value={`${r.min}-${r.max || ""}`}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verified === true}
                onChange={(e) => { setVerified(e.target.checked ? true : undefined); setPage(1); }}
                className="w-4 h-4 rounded border-gray-300 text-brand-indigo focus:ring-brand-indigo"
              />
              <span className="text-sm text-gray-700">Verified only</span>
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
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors duration-150 group"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <Avatar initials={p.username?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={p.id?.charCodeAt(0) || 0} />
                      )}
                      {p.verified && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-teal flex items-center justify-center ring-2 ring-white">
                          <BadgeCheck size={10} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/promoters/${p.username}`}
                          className="truncate text-sm font-medium text-gray-900 hover:text-brand-purple transition-colors"
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
                        <p className="truncate text-xs text-gray-500 mt-0.5">{p.headline}</p>
                      )}

                      {/* Stats */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-700 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                          <Briefcase size={10} className="text-brand-purple" />
                          {p.niche}
                        </span>
                        {p.location && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
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
                  <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100">
                    <Link
                      to={`/promoters/${p.username}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-purple hover:border-brand-purple/30 transition-colors"
                    >
                      <Eye size={12} />
                      Profile
                    </Link>
                    <button
                      onClick={() => handleSave(p.id)}
                      disabled={savePromoter.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-indigo text-white rounded-lg py-1.5 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Bookmark size={12} />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ArrowRight size={12} className="rotate-180" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      p === page
                        ? "bg-brand-indigo text-white"
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
