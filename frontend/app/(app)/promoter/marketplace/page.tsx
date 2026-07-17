"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useMarketplace, useBookmarkCampaign, useRemoveBookmark } from "@/features/marketplace/api";
import { useApplyToCampaign } from "@/features/applications/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search, Calendar, Clock, Bookmark, Share2, Filter, Sparkles,
  CheckCircle, X, Send, MoreVertical, Link as LinkIcon, Flag, Globe,
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
          <div className="h-px bg-slate-custom/10 my-1" />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); notifySuccess("Campaign reported."); }}
            className="w-full text-left px-4 py-2 text-sm text-coral-alert hover:bg-coral-alert/10 flex items-center gap-2"
          >
            <Flag size={14} /> Report
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
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<any | null>(null);

  const { data, isLoading } = useMarketplace({
    search: search || undefined,
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
      {/* HERO */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-custom/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-heading-lg text-graphite tracking-tight">Marketplace</h1>
          <p className="text-sm text-ash mt-1.5 max-w-md">Discover premium campaigns matched perfectly to your creator profile.</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-status bg-emerald-status/10 px-2.5 py-1 rounded-badges">
              <Sparkles size={12} /> {isLoading ? "…" : `${data?.total ?? 0} Available Campaigns`}
            </span>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className={`flex-1 md:flex-none h-11 px-6 rounded-inputs flex items-center justify-center gap-2 text-sm font-semibold transition-colors shadow-sm ${
              showCategories ? "bg-sky-wash text-signal-blue border border-signal-blue/20" : "bg-signal-blue text-white hover:opacity-90"
            }`}
          >
            <Filter size={16} /> Browse Categories
          </button>
        </div>
      </div>

      {/* CATEGORIES PANEL */}
      {showCategories && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-custom/10 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <button
            onClick={() => { setSelectedCategory(null); setPage(1); }}
            className={`p-4 rounded-inputs border flex flex-col items-center justify-center gap-2 transition-all ${
              selectedCategory === null
                ? "bg-sky-wash border-signal-blue text-signal-blue font-semibold"
                : "border-slate-custom/10 hover:border-slate-custom/20 bg-linen-canvas text-graphite"
            }`}
          >
            <Globe size={20} className={selectedCategory === null ? "text-signal-blue" : "text-ash"} />
            <span className="text-xs">All Categories</span>
          </button>
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setPage(1); }}
              className={`p-4 rounded-inputs border flex flex-col items-center justify-center gap-2 transition-all ${
                selectedCategory === cat
                  ? "bg-sky-wash border-signal-blue text-signal-blue font-semibold"
                  : "border-slate-custom/10 hover:border-slate-custom/20 bg-linen-canvas text-graphite"
              }`}
            >
              {getCategoryIcon(cat, selectedCategory === cat)}
              <span className="text-xs">{cat}</span>
            </button>
          ))}
        </div>
      )}

      {/* STICKY SEARCH TOOLBAR */}
      <div className="sticky top-0 z-30 bg-linen-canvas/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="bg-white p-2 rounded-cards shadow-sm border border-slate-custom/10 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
              <input
                type="text"
                placeholder="Search campaigns, brands, or categories..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-12 pl-11 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-fog text-graphite outline-none"
              />
            </div>
            <div className="hidden md:flex items-center gap-2 pr-2">
              <div className="h-8 w-px bg-slate-custom/10 mx-2" />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="h-10 pl-4 pr-10 text-sm font-medium text-graphite bg-linen-canvas border-none rounded-inputs focus:ring-0 cursor-pointer outline-none"
              >
                <option value="createdAt">Newest First</option>
                <option value="budget">Highest Budget</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
          {selectedCategory && (
            <div className="flex items-center gap-2 px-2 pb-1">
              <span className="text-xs text-ash font-medium">Category:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-badges bg-sky-wash border border-signal-blue/20 text-xs font-bold text-signal-blue">
                {selectedCategory}
                <button onClick={() => setSelectedCategory(null)} className="hover:bg-signal-blue/10 p-0.5 rounded-badges transition-colors">
                  <X size={12} />
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CAMPAIGN GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-[320px] animate-pulse shadow-sm border border-slate-custom/10" />
          ))}
        </div>
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
