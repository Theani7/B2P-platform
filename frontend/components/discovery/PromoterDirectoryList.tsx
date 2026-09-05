"use client";

import { useState } from "react";
import { usePromoterDirectory, useSavePromoter, useRemoveSavedPromoter, useSavedPromoters, type DirectorySearchParams } from "@/features/discovery/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/Stats";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useRouter } from "next/navigation";
import {
  Search, Users, MapPin, TrendingUp, Bookmark, BadgeCheck,
  Briefcase, ArrowRight, Star, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { ProfilePreviewModal } from "@/components/discovery/ProfilePreviewModal";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Profiles" },
  { value: "followers_count", label: "Most Followers" },
  { value: "engagement_rate", label: "Highest Engagement" },
  { value: "years_experience", label: "Most Experienced" },
];

const NICHE_OPTIONS = ["LIFESTYLE", "TECH", "FASHION", "FOOD"];

function SaveButton({ promoterId, saved, onToggle }: { promoterId: string; saved: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={saved ? "text-signal-blue hover:text-signal-blue/80 transition-colors" : "text-ash hover:text-signal-blue transition-colors"}
    >
      <Bookmark size={18} className={saved ? "fill-current" : ""} />
    </button>
  );
}

export function PromoterDirectoryList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("");
  const [verified, setVerified] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState("followers_count");
  const [page, setPage] = useState(1);
  const [drawerPromoter, setDrawerPromoter] = useState<any>(null);

  const { data, isLoading, error } = usePromoterDirectory({
    search: search || undefined,
    niche: niche || undefined,
    verified,
    sortBy,
    sortOrder: "desc",
    page,
    limit: 12,
  });

  const { data: savedData } = useSavedPromoters({ limit: 100 });
  const savedPromoterIds = new Set(savedData?.items?.map((p: any) => p.promoterProfileId) || []);

  const savePromoter = useSavePromoter();
  const removePromoter = useRemoveSavedPromoter();

  const handleSave = (id: string) => {
    if (savedPromoterIds.has(id)) {
      removePromoter.mutate(id, {
        onSuccess: () => { notifySuccess("Promoter removed from shortlist"); savedPromoterIds.delete(id); },
        onError: (e: any) => notifyError(e?.response?.data?.message ?? "Failed"),
      });
    } else {
      savePromoter.mutate(id, {
        onSuccess: () => { notifySuccess("Promoter saved to shortlist!"); savedPromoterIds.add(id); },
        onError: (e: any) => notifyError(e?.response?.data?.message ?? "Failed"),
      });
    }
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <p className="text-lg font-bold text-graphite">Error loading promoters</p>
      <p className="text-sm text-ash mt-2">{(error as Error).message}</p>
    </div>
  );

  const fmtCompact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `${n}`);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 120% at 100% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0) 60%)" }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-midnight-ink">Discover Promoters</h1>
            <p className="text-sm text-ash mt-2 max-w-xl">Find the perfect creators to elevate your next marketing campaign.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/business/saved-promoters")}
              className="inline-flex items-center gap-2 rounded-pill border border-slate-custom/10 bg-white px-5 py-2.5 text-sm font-semibold text-graphite shadow-product-card-sm transition-all hover:bg-sky-wash"
            >
              <Bookmark size={16} /> Saved Profiles
            </button>
            <button
              onClick={() => router.push("/business/campaigns/create")}
              className="inline-flex items-center gap-2 rounded-pill bg-signal-blue px-5 py-2.5 text-sm font-semibold text-white shadow-product-card transition-all hover:opacity-90"
            >
              <ArrowRight size={16} /> Post Campaign
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-cards-lg border border-steel/10 bg-gradient-to-br from-white to-sky-wash/50 p-[1px] shadow-product-card transition-transform hover:-translate-y-0.5">
          <StatCard label="Available Promoters" value={data?.total ? data.total.toLocaleString() : "—"} className="border-0 shadow-none bg-transparent" />
        </div>
        <div className="rounded-cards-lg border border-steel/10 bg-gradient-to-br from-white to-emerald-status/5 p-[1px] shadow-product-card transition-transform hover:-translate-y-0.5">
          <StatCard label="Verified Creators" value={data?.items ? data.items.filter((p: any) => p.verified).length.toLocaleString() : "—"} className="border-0 shadow-none bg-transparent" />
        </div>
        <div className="rounded-cards-lg border border-steel/10 bg-gradient-to-br from-white to-amber-tag/10 p-[1px] shadow-product-card transition-transform hover:-translate-y-0.5">
          <StatCard 
            label="Avg Engagement" 
            value={data?.items?.length ? `${(data.items.reduce((acc: number, p: any) => acc + (p.engagementRate || 0), 0) / data.items.length).toFixed(1)}%` : "—"} 
            className="border-0 shadow-none bg-transparent"
          />
        </div>
        <div className="rounded-cards-lg border border-steel/10 bg-gradient-to-br from-white to-sky-wash/50 p-[1px] shadow-product-card transition-transform hover:-translate-y-0.5">
          <StatCard 
            label="Combined Followers" 
            value={data?.items?.length ? fmtCompact(data.items.reduce((acc: number, p: any) => acc + (p.followersCount || 0), 0)) : "—"} 
            className="border-0 shadow-none bg-transparent"
          />
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-linen-canvas/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col gap-2.5 rounded-[1.75rem] border border-slate-custom/10 bg-white p-2.5 shadow-feature-section transition-shadow focus-within:border-signal-blue/40 focus-within:shadow-blue-focus lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-2xl bg-sky-wash text-signal-blue">
              <Search size={17} />
            </span>
            <input
              type="text"
              placeholder="Search promoters by name, niche, or location..."
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
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap lg:flex-nowrap items-center gap-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => { setVerified(verified ? undefined : true); setPage(1); }}
              className={`h-10 whitespace-nowrap rounded-pill px-4 text-xs font-semibold tracking-wide transition-all border ${verified ? "bg-midnight-ink text-white shadow-product-card border-midnight-ink" : "bg-white border-slate-custom/10 text-ash hover:bg-sky-wash hover:text-graphite"}`}
            >
              Verified Only
            </button>
            {NICHE_OPTIONS.slice(0, 4).map((n) => (
              <button
                key={n}
                onClick={() => { setNiche(niche === n ? "" : n); setPage(1); }}
                className={`h-10 whitespace-nowrap rounded-pill px-4 text-xs font-semibold tracking-wide transition-all border ${niche === n ? "bg-midnight-ink text-white shadow-product-card border-midnight-ink" : "bg-white border-slate-custom/10 text-ash hover:bg-sky-wash hover:text-graphite"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="h-11 cursor-pointer appearance-none rounded-2xl bg-linen-canvas px-4 text-[13px] font-semibold text-graphite outline-none transition-colors hover:bg-sky-wash ml-auto"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="min-h-[400px]">
        {isLoading ? (
          <SkeletonCards count={6} />
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-cards-lg shadow-product-card border border-slate-custom/10">
            <div className="w-20 h-20 rounded-full bg-linen-canvas flex items-center justify-center mb-5 shadow-product-card-sm border border-slate-custom/10">
              <Search size={32} className="text-ash" />
            </div>
            <h3 className="text-heading text-graphite">No creators found</h3>
            <p className="text-sm text-ash mt-2 max-w-md">We couldn't find any promoters matching your current filters. Try broadening your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => setDrawerPromoter(p)}
                  className="bg-white rounded-cards-lg p-6 shadow-product-card border border-slate-custom/10 hover:-translate-y-1 hover:border-signal-blue/30 hover:shadow-feature-section transition-all duration-200 cursor-pointer flex flex-col group relative overflow-hidden"
                >
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="relative">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover shadow-product-card-sm border border-slate-custom/10" />
                      ) : (
                        <Avatar initials={p.username?.[0]?.toUpperCase() ?? "?"} size="lg" colorIndex={p.id?.charCodeAt(0) || 0} />
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
                        <SaveButton promoterId={p.id} saved={savedPromoterIds.has(p.id)} onToggle={() => handleSave(p.id)} />
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
