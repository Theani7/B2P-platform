"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useMarketplace, useBookmarkCampaign, useRemoveBookmark } from "@/features/marketplace/api";
import { useApplyToCampaign } from "@/features/applications/api";
import { useDebounce } from "@/lib/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
import { SkeletonCards } from "@/components/ui/Skeleton";
import {
  Search, Calendar, Clock, Bookmark, Share2, Filter, Sparkles,
  CheckCircle, X, Send, MoreVertical, Link as LinkIcon, Globe,
  Laptop, Heart, Utensils, Plane, Dumbbell, Gamepad2, GraduationCap, Film, Coins, Package,
} from "lucide-react";

const fmtNpr = (n: number) =>
  "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);

const MARKETPLACE_CATEGORIES = [
  "Fashion", "Tech", "Beauty", "Food", "Travel",
  "Fitness", "Gaming", "Education", "Entertainment", "Finance",
];

function safeDaysBetween(a?: string | null, b?: string | null): number {
  if (!a || !b) return 0;
  return Math.max(0, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

function safeDaysUntil(d?: string | null): number {
  if (!d) return 0;
  return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000));
}

function CardMenu({ campaignId, campaignTitle }: { campaignId: string; campaignTitle: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    const url = `${window.location.origin}/promoter/marketplace?campaignId=${campaignId}`;
    navigator.clipboard.writeText(url);
    notifySuccess("Campaign link copied!");
  };

  const share = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    const url = `${window.location.origin}/promoter/marketplace?campaignId=${campaignId}`;
    if (navigator.share) navigator.share({ title: campaignTitle, url }).catch(() => {});
    else {
      navigator.clipboard.writeText(url);
      notifySuccess("Campaign link copied!");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-ash hover:bg-sky-wash hover:text-graphite transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-cards shadow-product-card border border-slate-custom/10 z-20 py-1">
          <button onClick={share} className="w-full text-left px-4 py-2 text-sm text-graphite hover:bg-sky-wash flex items-center gap-2">
            <Share2 size={14} /> Share
          </button>
          <button onClick={copyLink} className="w-full text-left px-4 py-2 text-sm text-graphite hover:bg-sky-wash flex items-center gap-2">
            <LinkIcon size={14} /> Copy Link
          </button>
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(c: string, active: boolean) {
  const cls = active ? "text-signal-blue" : "text-ash";
  switch (c) {
    case "Fashion": return <Sparkles size={20} className={cls} />;
    case "Tech": return <Laptop size={20} className={cls} />;
    case "Beauty": return <Heart size={20} className={cls} />;
    case "Food": return <Utensils size={20} className={cls} />;
    case "Travel": return <Plane size={20} className={cls} />;
    case "Fitness": return <Dumbbell size={20} className={cls} />;
    case "Gaming": return <Gamepad2 size={20} className={cls} />;
    case "Education": return <GraduationCap size={20} className={cls} />;
    case "Entertainment": return <Film size={20} className={cls} />;
    case "Finance": return <Coins size={20} className={cls} />;
    default: return <Package size={20} className={cls} />;
  }
}

function MarketplaceInner() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<any | null>(null);

  const { data, isLoading, isFetching } = useMarketplace({
    search: debouncedSearch || undefined,
    category: selectedCategory || undefined,
    page,
    limit: 12,
    sort,
  });
  const bookmark = useBookmarkCampaign();
  const removeBookmark = useRemoveBookmark();
  const apply = useApplyToCampaign();

  const handleApplyOpen = (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCampaignId(id);
    setSelectedCampaignTitle(title);
    setShowApplyModal(true);
  };

  const handleApply = () => {
    if (!selectedCampaignId) return;
    apply.mutate(
      { campaignId: selectedCampaignId, message: applyMessage || undefined },
      {
        onSuccess: () => {
          notifySuccess("Application submitted!");
          // Invalidate marketplace so hasApplied updates on the card immediately
          qc.invalidateQueries({ queryKey: ["marketplace"] });
          setShowApplyModal(false);
          setApplyMessage("");
          setSelectedCampaignId(null);
          setSelectedCampaignTitle("");
        },
        onError: (e: any) => notifyError(e?.response?.data?.message ?? "Could not apply"),
      },
    );
  };

  const toggleBookmark = (e: React.MouseEvent, c: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (c.isBookmarked) {
      removeBookmark.mutate(c.id, {
        onSuccess: () => notifySuccess("Bookmark removed"),
        onError: () => notifyError("Could not remove bookmark"),
      });
    } else {
      bookmark.mutate(c.id, {
        onSuccess: () => notifySuccess("Bookmarked!"),
        onError: () => notifyError("Could not bookmark"),
      });
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* SIGNATURE HERO BANNER */}
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 120% at 100% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0) 60%)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-midnight-ink">Marketplace</h1>
            <p className="text-sm text-ash mt-2 max-w-xl">Discover premium campaigns matched perfectly to your creator profile.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-sky-wash border border-signal-blue/20 px-4 py-2 text-xs font-bold text-signal-blue shadow-sm">
            <Sparkles size={14} className="text-signal-blue" /> {isLoading ? "…" : `${data?.total ?? 0} Available Campaigns`}
          </span>
        </div>
      </div>

      {/* CATEGORIES — always visible, act as search filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          onClick={() => { setSelectedCategory(null); setPage(1); }}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-pill px-4 py-2 text-xs font-semibold transition-all ${
            selectedCategory === null
              ? "bg-midnight-ink text-white shadow-product-card"
              : "bg-white text-ash border border-slate-custom/10 hover:border-signal-blue/40 hover:text-graphite"
          }`}
        >
          <Globe size={14} />
          All
        </button>
        {MARKETPLACE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(selectedCategory === cat ? null : cat); setPage(1); }}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-pill px-4 py-2 text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-midnight-ink text-white shadow-product-card"
                : "bg-white text-ash border border-slate-custom/10 hover:border-signal-blue/40 hover:text-graphite"
            }`}
          >
            {getCategoryIcon(cat, selectedCategory === cat)}
            {cat}
          </button>
        ))}
      </div>

      {/* STICKY SEARCH TOOLBAR */}
      <div className="sticky top-0 z-30 bg-linen-canvas/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col gap-2.5 rounded-[1.75rem] border border-slate-custom/10 bg-white p-2.5 shadow-feature-section transition-shadow focus-within:border-signal-blue/40 focus-within:shadow-blue-focus md:flex-row md:items-center">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-2xl bg-sky-wash text-signal-blue">
              <Search size={17} />
            </span>
            <input
              type="text"
              placeholder="Search campaigns, brands, or categories..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-14 w-full bg-transparent pl-16 pr-11 text-[15px] font-medium text-graphite placeholder-fog outline-none"
            />
            {(isFetching && !isLoading) || search !== debouncedSearch ? (
              <span className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-steel/20 border-t-signal-blue" />
            ) : search ? (
              <button
                onClick={() => { setSearch(""); setPage(1); }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-custom/10 text-ash transition-colors hover:bg-slate-custom/20 hover:text-graphite"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2.5 pb-1 md:pb-0 md:pr-1.5">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill bg-midnight-ink px-3.5 py-2 text-xs font-semibold text-white">
                {selectedCategory}
                <button onClick={() => { setSelectedCategory(null); setPage(1); }} aria-label="Clear category" className="rounded-full transition-opacity hover:opacity-70">
                  <X size={12} />
                </button>
              </span>
            )}
            <span className="font-roboto-mono hidden whitespace-nowrap text-xs text-fog md:inline">
              {isLoading ? "…" : `${data?.total ?? 0} found`}
            </span>
            <span className="hidden h-8 w-px bg-slate-custom/10 md:inline-block" />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              aria-label="Sort campaigns"
              className="h-11 cursor-pointer rounded-2xl bg-linen-canvas px-4 text-[13px] font-semibold text-graphite outline-none transition-colors hover:bg-sky-wash"
            >
              <option value="createdAt">Newest first</option>
              <option value="budget">Highest budget</option>
              <option value="title">A – Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* CAMPAIGN GRID */}
      {isLoading ? (
        <SkeletonCards count={6} />
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-custom/10 p-16 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-linen-canvas rounded-full flex items-center justify-center text-ash mb-4">
            <Search size={32} />
          </div>
          <h2 className="text-heading text-graphite mb-2">No campaigns found</h2>
          <p className="text-sm text-ash max-w-sm mb-6">Try adjusting your filters or search terms.</p>
          <button
            onClick={() => { setSearch(""); setPage(1); setSelectedCategory(null); }}
            className="h-11 px-6 rounded-inputs bg-signal-blue text-white text-sm font-bold hover:opacity-90 transition-colors shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.items.map((c: any) => (
              <div
                key={c.id}
                className="bg-white rounded-xl shadow-sm border border-slate-custom/10 hover:border-signal-blue/20 hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden group cursor-pointer"
              >
                <div className="p-6 flex-1 flex flex-col relative">
                  <div className="absolute top-5 right-5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => toggleBookmark(e, c)}
                      className={`w-8 h-8 rounded-full shadow-sm border border-slate-custom/10 flex items-center justify-center transition-colors ${
                        c.isBookmarked ? "bg-sky-wash text-signal-blue" : "bg-white text-ash hover:text-signal-blue hover:bg-sky-wash"
                      }`}
                    >
                      <Bookmark size={14} className={c.isBookmarked ? "fill-current" : ""} />
                    </button>
                    <CardMenu campaignId={c.id} campaignTitle={c.title} />
                  </div>

                  <div className="flex items-center gap-3 mb-4 pr-16">
                    <div className="w-12 h-12 rounded-button bg-gradient-to-br from-sky-wash to-white ring-1 ring-slate-custom/10 flex items-center justify-center flex-shrink-0 text-xl font-bold text-signal-blue">
                      {c.businessName?.charAt(0).toUpperCase() || "B"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-ash truncate max-w-[120px]">{c.businessName}</span>
                        <CheckCircle size={14} className="text-signal-blue" />
                      </div>
                      <span className="inline-flex mt-0.5 text-[10px] font-bold text-fog uppercase tracking-wider">{c.category}</span>
                    </div>
                  </div>

                  <h3 className="text-heading text-graphite leading-tight mb-2 group-hover:text-signal-blue transition-colors line-clamp-2">
                    {c.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm font-bold text-graphite mb-4">
                    <span className="flex items-center gap-1.5 text-emerald-status bg-emerald-status/10 px-2 py-1 rounded-inputs">
                      {fmtNpr(c.budget)}
                    </span>
                    <span className="flex items-center gap-1.5 text-ash">
                      <Clock size={14} /> {safeDaysBetween(c.startDate, c.endDate)} days
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2.5 py-1 rounded-inputs bg-linen-canvas text-graphite text-xs font-semibold border border-slate-custom/10">
                      {c.category}
                    </span>
                    {c.requirements && (
                      <span className="px-2.5 py-1 rounded-inputs bg-linen-canvas text-graphite text-xs font-semibold border border-slate-custom/10 max-w-[200px] truncate">
                        {c.requirements}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto border-t border-slate-custom/10 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(3, c.applicantCount || 0) }, (_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-sky-wash border-2 border-white" />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-fog">{c.applicantCount || 0} applied</span>
                    </div>
                    <span className="text-xs font-semibold text-fog flex items-center gap-1">
                      <Calendar size={12} /> Ends in {safeDaysUntil(c.endDate)}d
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 bg-linen-canvas border-t border-slate-custom/10 flex gap-3">
                  <button
                    onClick={(e) => { if (!c.hasApplied) handleApplyOpen(c.id, c.title, e); }}
                    disabled={c.hasApplied}
                    className={`flex-1 h-10 rounded-inputs text-sm font-bold transition-colors shadow-sm ${
                      c.hasApplied ? "bg-sky-wash text-ash cursor-not-allowed" : "bg-graphite text-white hover:bg-signal-blue"
                    }`}
                  >
                    {c.hasApplied ? "Applied ✓" : "Apply Now"}
                  </button>
                  <button
                    onClick={() => setSelectedCampaignDetails(c)}
                    type="button"
                    className="flex-1 h-10 rounded-inputs bg-white border border-slate-custom/10 text-graphite text-sm font-bold hover:bg-sky-wash transition-colors flex items-center justify-center shadow-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-10 px-4 rounded-inputs border border-slate-custom/10 text-sm font-semibold hover:bg-sky-wash disabled:opacity-50"
              >
                Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-inputs text-sm font-bold ${p === page ? "bg-graphite text-white" : "text-ash hover:bg-sky-wash"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="h-10 px-4 rounded-inputs border border-slate-custom/10 text-sm font-semibold hover:bg-sky-wash disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          <p className="text-center text-xs text-fog">
            Showing {data.items.length} of {data.total} campaigns
          </p>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-custom/10 flex items-center justify-between">
              <h2 className="text-heading text-graphite">Submit Application</h2>
              <button onClick={() => { setShowApplyModal(false); setApplyMessage(""); }} className="text-ash hover:text-graphite">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-sky-wash rounded-inputs border border-slate-custom/10 text-sm">
                Applying to <span className="font-bold text-signal-blue">{selectedCampaignTitle}</span>
              </div>
              <label className="block text-sm font-semibold text-graphite mb-2">
                Cover Message <span className="text-fog font-normal">(Optional)</span>
              </label>
              <textarea
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                placeholder="Why are you a good fit for this campaign?"
                className="w-full h-32 rounded-inputs border border-slate-custom/10 bg-linen-canvas focus:bg-white focus:ring-2 focus:ring-signal-blue/20 focus:border-signal-blue text-sm p-4 resize-none transition-all outline-none"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => { setShowApplyModal(false); setApplyMessage(""); }}
                  className="h-11 px-6 rounded-inputs border border-slate-custom/10 text-sm font-semibold text-graphite hover:bg-sky-wash"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={apply.isPending}
                  className="h-11 px-6 rounded-inputs bg-signal-blue text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={16} /> {apply.isPending ? "Sending…" : "Send Application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedCampaignDetails && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-custom/10 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-heading text-graphite line-clamp-1">{selectedCampaignDetails.title}</h2>
              <button onClick={() => setSelectedCampaignDetails(null)} className="text-ash hover:text-graphite">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-button bg-gradient-to-br from-sky-wash to-white ring-1 ring-slate-custom/10 flex items-center justify-center flex-shrink-0 text-xl font-bold text-signal-blue">
                  {selectedCampaignDetails.businessName?.charAt(0).toUpperCase() || "B"}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-graphite">{selectedCampaignDetails.businessName}</span>
                    <CheckCircle size={14} className="text-signal-blue" />
                  </div>
                  <span className="inline-flex mt-0.5 text-[10px] font-bold text-fog uppercase tracking-wider">
                    {selectedCampaignDetails.category}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {selectedCampaignDetails.description && (
                  <div>
                    <h3 className="text-xs font-bold text-ash uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-sm text-graphite leading-relaxed whitespace-pre-wrap">{selectedCampaignDetails.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-linen-canvas p-3 rounded-inputs border border-slate-custom/10">
                    <span className="text-[10px] font-bold text-fog uppercase tracking-wider block mb-1">Budget</span>
                    <span className="text-sm font-bold text-emerald-status">{fmtNpr(selectedCampaignDetails.budget)}</span>
                  </div>
                  <div className="bg-linen-canvas p-3 rounded-inputs border border-slate-custom/10">
                    <span className="text-[10px] font-bold text-fog uppercase tracking-wider block mb-1">Location</span>
                    <span className="text-sm font-medium text-graphite">{selectedCampaignDetails.location || "Anywhere"}</span>
                  </div>
                  <div className="bg-linen-canvas p-3 rounded-inputs border border-slate-custom/10">
                    <span className="text-[10px] font-bold text-fog uppercase tracking-wider block mb-1">Start Date</span>
                    <span className="text-sm font-medium text-graphite">
                      {selectedCampaignDetails.startDate ? new Date(selectedCampaignDetails.startDate).toLocaleDateString() : "TBD"}
                    </span>
                  </div>
                  <div className="bg-linen-canvas p-3 rounded-inputs border border-slate-custom/10">
                    <span className="text-[10px] font-bold text-fog uppercase tracking-wider block mb-1">End Date</span>
                    <span className="text-sm font-medium text-graphite">
                      {selectedCampaignDetails.endDate ? new Date(selectedCampaignDetails.endDate).toLocaleDateString() : "TBD"}
                    </span>
                  </div>
                </div>

                {selectedCampaignDetails.targetAudience && (
                  <div>
                    <h3 className="text-xs font-bold text-ash uppercase tracking-wider mb-2">Target Audience</h3>
                    <p className="text-sm text-graphite leading-relaxed">{selectedCampaignDetails.targetAudience}</p>
                  </div>
                )}

                {selectedCampaignDetails.requirements && (
                  <div>
                    <h3 className="text-xs font-bold text-ash uppercase tracking-wider mb-2">Requirements</h3>
                    <p className="text-sm text-graphite leading-relaxed whitespace-pre-wrap">{selectedCampaignDetails.requirements}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-linen-canvas border-t border-slate-custom/10 flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setSelectedCampaignDetails(null)}
                className="h-10 px-6 rounded-inputs border border-slate-custom/10 text-sm font-semibold text-graphite hover:bg-sky-wash"
              >
                Close
              </button>
              <button
                onClick={(e) => {
                  if (!selectedCampaignDetails.hasApplied) {
                    setSelectedCampaignDetails(null);
                    handleApplyOpen(selectedCampaignDetails.id, selectedCampaignDetails.title, e);
                  }
                }}
                disabled={selectedCampaignDetails.hasApplied}
                className={`h-10 px-6 rounded-inputs text-sm font-bold shadow-sm transition-colors ${
                  selectedCampaignDetails.hasApplied
                    ? "bg-sky-wash text-ash cursor-not-allowed"
                    : "bg-signal-blue text-white hover:opacity-90"
                }`}
              >
                {selectedCampaignDetails.hasApplied ? "Already Applied" : "Apply Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <RequireAuth role={Role.PROMOTER}>
      <MarketplaceInner />
    </RequireAuth>
  );
}
