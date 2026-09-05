"use client";

import { useState, useEffect } from "react";
import { useSavedPromoters, useRemoveSavedPromoter } from "@/features/discovery/api";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, BadgeCheck, BookmarkX,
  Star, ChevronLeft, ChevronRight, X, Filter,
} from "lucide-react";

const NICHE_OPTIONS = ["LIFESTYLE", "TECH", "FASHION", "FOOD", "TRAVEL", "FITNESS", "GAMING", "BUSINESS"];

function RemoveButton({ promoterId, onRemove }: { promoterId: string; onRemove: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onRemove(); }}
      className="w-full rounded-pill bg-linen-canvas px-4 py-2 text-sm font-semibold text-graphite transition-colors hover:bg-sky-wash"
    >
      Remove
    </button>
  );
}

export function SavedPromotersList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [nicheFilter, setNicheFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useSavedPromoters({ search: search || undefined, page, limit: 12 });
  const removeSaved = useRemoveSavedPromoter();

  useEffect(() => {
    setRemovedIds(new Set());
  }, [data]);

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
    // Optimistically remove from view immediately
    setRemovedIds((prev) => new Set(prev).add(id));
    removeSaved.mutate(id, {
      onSuccess: () => notifySuccess(`${username} removed from shortlist`),
      onError: (e: any) => {
        setRemovedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        notifyError(e?.response?.data?.message ?? "Failed to remove");
      },
    });
  };

  const filteredPromoters = (() => {
    if (!data?.items) return [];
    let items = data.items
      .filter((item: any) => {
        const promoterId = item.promoterProfileId || item.promoterProfile?.id || item.id;
        return !removedIds.has(promoterId);
      })
      .map((item: any) => ({
        ...(item.promoterProfile || item.promoter || {}),
        savedId: item.promoterProfileId || item.id,
      }));
    if (nicheFilter) items = items.filter((p: any) => p.niche === nicheFilter);
    if (sortFilter === "followers") items.sort((a: any, b: any) => (b.followersCount || 0) - (a.followersCount || 0));
    else if (sortFilter === "engagement") items.sort((a: any, b: any) => (b.engagementRate || 0) - (a.engagementRate || 0));
    return items;
  })();

  const fmtCompact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `${n}`);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-32">
      <div className="sticky top-0 z-30 bg-linen-canvas/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col gap-2.5 rounded-[1.75rem] border border-slate-custom/10 bg-white p-2.5 shadow-feature-section transition-shadow focus-within:border-signal-blue/40 focus-within:shadow-blue-focus lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-2xl bg-sky-wash text-signal-blue">
              <Search size={17} />
            </span>
            <input
              type="text"
              placeholder="Search saved promoters..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-14 w-full bg-transparent pl-16 pr-11 text-[15px] font-medium text-graphite placeholder-fog outline-none"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setPage(1); }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-custom/10 text-ash transition-colors hover:bg-slate-custom/20 hover:text-graphite"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5 pb-1 lg:pb-0 lg:pr-1.5">
            <span className="font-roboto-mono hidden whitespace-nowrap text-xs text-fog md:inline">
              {data?.total ?? 0} found
            </span>
            <span className="hidden h-8 w-px bg-slate-custom/10 md:inline-block" />
            <select
              value={nicheFilter}
              onChange={(e) => { setNicheFilter(e.target.value); setPage(1); }}
              className="h-11 cursor-pointer rounded-2xl bg-linen-canvas px-4 text-[13px] font-semibold text-graphite outline-none transition-colors hover:bg-sky-wash"
            >
              <option value="">All Categories</option>
              {NICHE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <select
              value={sortFilter}
              onChange={(e) => { setSortFilter(e.target.value); setPage(1); }}
              className="h-11 cursor-pointer rounded-2xl bg-linen-canvas px-4 text-[13px] font-semibold text-graphite outline-none transition-colors hover:bg-sky-wash"
            >
              <option value="newest">Newest First</option>
              <option value="followers">Most Followers</option>
              <option value="engagement">Highest Engagement</option>
            </select>
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {isLoading ? (
          <SkeletonCards count={6} />
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-cards-lg shadow-product-card border border-slate-custom/10">
            <div className="w-20 h-20 rounded-full bg-linen-canvas flex items-center justify-center mb-5 shadow-product-card-sm border border-slate-custom/10">
              <BookmarkX size={32} className="text-ash" />
            </div>
            <h3 className="text-heading text-graphite">No saved promoters yet</h3>
            <p className="text-sm text-ash mt-2 max-w-md">Save promoters from the directory to quickly access them later when building your campaigns.</p>
            <button
              onClick={() => router.push("/business/promoters")}
              className="mt-6 inline-flex items-center gap-2 rounded-pill bg-signal-blue px-6 py-2.5 text-sm font-semibold text-white shadow-product-card transition-all hover:opacity-90"
            >
              <Search size={16} /> Browse Promoters
            </button>
          </div>
        ) : filteredPromoters.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-cards-lg shadow-product-card border border-slate-custom/10">
            <div className="w-20 h-20 rounded-full bg-linen-canvas flex items-center justify-center mb-5 shadow-product-card-sm border border-slate-custom/10">
              <Filter size={32} className="text-ash" />
            </div>
            <h3 className="text-heading text-graphite">No results found</h3>
            <p className="text-sm text-ash mt-2 max-w-md">No saved promoters match your current filters. Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromoters.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/u/${p.username}`)}
                  className="bg-white rounded-cards-lg p-6 shadow-product-card border border-slate-custom/10 hover:-translate-y-1 hover:border-signal-blue/30 hover:shadow-feature-section transition-all duration-200 cursor-pointer flex flex-col group"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover shadow-product-card-sm border border-slate-custom/10" />
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
                      <h3 className="text-base font-bold text-graphite truncate group-hover:text-signal-blue transition-colors">{p.username}</h3>
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

                  <div className="grid grid-cols-3 gap-2 mt-auto pt-6">
                    <div className="flex flex-col items-center p-2 rounded-inputs bg-linen-canvas/80 border border-slate-custom/10">
                      <span className="text-sm font-bold text-graphite">{fmtCompact(p.followersCount)}</span>
                      <span className="text-[10px] text-ash font-medium mt-0.5">Followers</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-inputs bg-linen-canvas/80 border border-slate-custom/10">
                      <span className="text-sm font-bold text-graphite">{(p.engagementRate || 0).toFixed(1)}%</span>
                      <span className="text-[10px] text-ash font-medium mt-0.5">Engagement</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-inputs bg-linen-canvas/80 border border-slate-custom/10">
                      <span className="text-sm font-bold text-graphite flex items-center gap-0.5">{p.averageRating ? p.averageRating.toFixed(1) : "0.0"} <Star size={10} className="text-amber-400 fill-amber-400" /></span>
                      <span className="text-[10px] text-ash font-medium mt-0.5">Rating</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-custom/10 flex gap-2">
                    <RemoveButton promoterId={p.id} onRemove={() => handleRemove(p.id, p.username)} />
                  </div>
                </div>
              ))}
            </div>

            {data.pages > 0 && (
              <div className="mt-8 flex items-center justify-between rounded-cards-lg border border-slate-custom/10 bg-white px-6 py-4 shadow-product-card">
                <p className="text-sm text-ash">
                  Showing <span className="font-semibold text-graphite">{(page - 1) * 12 + 1}</span> to <span className="font-semibold text-graphite">{Math.min(page * 12, data.total || page * 12)}</span> of <span className="font-semibold text-graphite">{data.total || "?"}</span> profiles
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-inputs border border-slate-custom/10 text-ash hover:bg-sky-wash disabled:opacity-50 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="p-2 rounded-inputs border border-slate-custom/10 text-ash hover:bg-sky-wash disabled:opacity-50 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
