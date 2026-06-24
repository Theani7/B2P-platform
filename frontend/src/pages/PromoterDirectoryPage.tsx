import { useState } from "react";
import { Link } from "react-router-dom";
import { usePromoterDirectory, useSavePromoter } from "../features/discovery/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";

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
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

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
      onSuccess: () => notifySuccess("Promoter saved to shortlist"),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Discover Promoters</h1>
        <Link
          to="/business/saved-promoters"
          className="rounded border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
        >
          View Shortlist
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by username, headline, bio, niche, or location..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="block w-full rounded-lg border border-gray-300 p-3 text-sm"
      />

      <div className="flex gap-6">
        <aside className="w-64 shrink-0 space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text">Niche</h3>
            <select
              value={niche}
              onChange={(e) => { setNiche(e.target.value); setPage(1); }}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              <option value="">All Niches</option>
              {NICHE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-text">Location</h3>
            <input
              type="text"
              placeholder="City, country..."
              value={location}
              onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-text">Followers</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleFollowerRange(undefined, undefined)}
                className={`block w-full rounded px-2 py-1 text-left text-sm ${!followersMin && !followersMax ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
              >
                All
              </button>
              {FOLLOWER_RANGES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => handleFollowerRange(r.min, r.max)}
                  className={`block w-full rounded px-2 py-1 text-left text-sm ${followersMin === r.min && followersMax === r.max ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-text">Experience</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleExperienceRange(undefined, undefined)}
                className={`block w-full rounded px-2 py-1 text-left text-sm ${!experienceMin && !experienceMax ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
              >
                All
              </button>
              {EXPERIENCE_RANGES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => handleExperienceRange(r.min, r.max)}
                  className={`block w-full rounded px-2 py-1 text-left text-sm ${experienceMin === r.min && experienceMax === r.max ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-text">Verified Only</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={verified === true}
                onChange={(e) => { setVerified(e.target.checked ? true : undefined); setPage(1); }}
                className="rounded"
              />
              Show verified only
            </label>
          </div>

          <button
            onClick={clearFilters}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </aside>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {data ? `${data.total} promoter${data.total !== 1 ? "s" : ""} found` : ""}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="rounded border border-gray-300 p-2 text-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
                className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                title="Toggle sort order"
              >
                {sortOrder === "desc" ? "↓" : "↑"}
              </button>
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No promoters found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.items.map((p) => (
                  <div key={p.id} className="rounded-lg border bg-white p-4 hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          p.username[0].toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/promoters/${p.username}`}
                            className="truncate font-semibold text-text hover:text-primary"
                          >
                            {p.username}
                          </Link>
                          {p.verified && (
                            <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                              Verified
                            </span>
                          )}
                        </div>
                        {p.headline && (
                          <p className="truncate text-sm text-gray-600">{p.headline}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium">{p.niche}</span>
                        {p.location && <span>{p.location}</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span>{p.followers_count.toLocaleString()} followers</span>
                        <span>{p.engagement_rate.toFixed(1)}% eng.</span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/promoters/${p.username}`}
                        className="flex-1 rounded border border-primary py-1.5 text-center text-sm font-medium text-primary hover:bg-primary/5"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => handleSave(p.id)}
                        disabled={savePromoter.isPending}
                        className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {data.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {data.page} of {data.pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
