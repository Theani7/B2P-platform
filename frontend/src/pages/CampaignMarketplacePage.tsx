import { useState } from "react";
import { useCampaignMarketplace, useApplyToCampaign } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";
import {
  Store,
  Search,
  MapPin,
  DollarSign,
  CalendarDays,
  ArrowRight,
  Send,
  X,
  Briefcase,
  Building2,
  ArrowUpDown,
} from "lucide-react";

export default function CampaignMarketplacePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("created_at");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState("");
  const [applyMessage, setApplyMessage] = useState("");

  const { data, isLoading } = useCampaignMarketplace({
    search: search || undefined,
    page,
    limit: 12,
    sort,
  });

  const applyMutation = useApplyToCampaign();

  const handleApplyOpen = (id: string, title: string) => {
    setSelectedCampaignId(id);
    setSelectedCampaignTitle(title);
    setShowApplyModal(true);
  };

  const handleApply = () => {
    if (!selectedCampaignId) return;
    applyMutation.mutate(
      { campaignId: selectedCampaignId, message: applyMessage || undefined },
      {
        onSuccess: () => {
          notifySuccess("Application submitted successfully!");
          setShowApplyModal(false);
          setApplyMessage("");
          setSelectedCampaignId(null);
          setSelectedCampaignTitle("");
        },
        onError: (e) => notifyError(e.message),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-teal via-brand-teal-900 to-brand-purple-900 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shadow-lg ring-1 ring-white/20">
            <Store size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-white">Campaign Marketplace</h1>
            <p className="text-sm text-white/70 mt-0.5">Discover and apply to brand campaigns</p>
          </div>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, category, or location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-3 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all cursor-pointer"
          >
            <option value="created_at">Newest</option>
            <option value="budget">Budget</option>
            <option value="title">Title</option>
          </select>
          <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No campaigns found"
          description="There are no open public campaigns available right now."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
              >
                <div className="p-5 flex flex-col flex-1">
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-brand-teal-50 text-brand-teal-900 ring-1 ring-brand-teal/10">
                      <Briefcase size={10} />
                      {c.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal">
                      <DollarSign size={14} />
                      {c.budget.toLocaleString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-base font-medium text-gray-900 line-clamp-1">{c.title}</h3>

                  {/* Business */}
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <Building2 size={11} className="text-gray-400" />
                    {c.business_name}
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">{c.description}</p>

                  {/* Meta */}
                  <div className="mt-4 flex items-center gap-3 text-xs text-gray-400 pt-4 border-t border-gray-50">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={10} />
                      {c.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={10} />
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric"
                      })}
                    </span>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => handleApplyOpen(c.id, c.title)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-indigo text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Send size={14} />
                    Apply Now
                  </button>
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

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium text-gray-900">Apply to Campaign</h2>
                <button
                  onClick={() => { setShowApplyModal(false); setApplyMessage(""); setSelectedCampaignId(null); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Applying to <span className="font-medium text-gray-900">{selectedCampaignTitle}</span>
              </p>

              <textarea
                placeholder="Add a message to the business (optional)..."
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple resize-none transition-all"
                rows={4}
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => { setShowApplyModal(false); setApplyMessage(""); setSelectedCampaignId(null); }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applyMutation.isPending}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-indigo text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                >
                  <Send size={14} />
                  {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
