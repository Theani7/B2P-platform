import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaignMatches, useGenerateMatches } from "../features/matching/api";
import { useInvitePromoter } from "../features/collaboration/api";
import MatchResultsCard from "../components/matching/MatchResultsCard";
import MatchBreakdownCard from "../components/matching/MatchBreakdownCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { PageHeader } from "../components/ui";
import { notifySuccess, notifyError } from "../hooks/useToast";

type FilterKey = "all" | "EXCELLENT_MATCH" | "GOOD_MATCH" | "AVERAGE_MATCH" | "LOW_MATCH";

export default function CampaignMatchesPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [page, setPage] = useState(1);
  const [filterClassification, setFilterClassification] = useState<FilterKey>("all");
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [generating, setGenerating] = useState(false);

  const classificationParam = filterClassification === "all" ? undefined : filterClassification;

  const { data, isLoading } = useCampaignMatches(campaignId!, {
    page,
    limit: 10,
    classification: classificationParam,
    min_score: minScore,
    verified: verifiedOnly || undefined,
  });

  const generateMutation = useGenerateMatches(campaignId!);
  const inviteMutation = useInvitePromoter();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateMutation.mutateAsync();
      notifySuccess("Match results generated");
    } catch {
      notifyError("Failed to generate matches");
    } finally {
      setGenerating(false);
    }
  };

  const handleInvite = async (promoterId: string) => {
    try {
      await inviteMutation.mutateAsync({ campaignId: campaignId!, promoterId, message: "" });
      notifySuccess("Invitation sent");
    } catch {
      notifyError("Failed to send invitation");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={`/business/campaigns/${campaignId}`}
          className="text-xs text-signal-blue hover:underline inline-flex items-center gap-1 font-medium"
        >
          &larr; Back to Campaign
        </Link>
      </div>

      <PageHeader
        title="Recommended Promoters"
        actions={
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-signal-blue text-white rounded-button px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Recommendations"}
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-custom/10 rounded-cards p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-fog">
            Classification
          </label>
          <select
            value={filterClassification}
            onChange={(e) => { setFilterClassification(e.target.value as FilterKey); setPage(1); }}
            className="px-3 py-2 text-sm border border-slate-custom/10 rounded-inputs bg-white text-graphite focus:outline-none focus:border-signal-blue focus:ring-signal-blue/10"
          >
            <option value="all">All</option>
            <option value="EXCELLENT_MATCH">Excellent</option>
            <option value="GOOD_MATCH">Good</option>
            <option value="AVERAGE_MATCH">Average</option>
            <option value="LOW_MATCH">Low</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-fog">
            Min Score
          </label>
          <select
            value={minScore ?? ""}
            onChange={(e) => { setMinScore(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className="px-3 py-2 text-sm border border-slate-custom/10 rounded-inputs bg-white text-graphite focus:outline-none focus:border-signal-blue focus:ring-signal-blue/10"
          >
            <option value="">Any</option>
            <option value="90">90+</option>
            <option value="70">70+</option>
            <option value="50">50+</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-0.5">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
            className="w-4 h-4 rounded-inputs border-slate-custom/10 text-signal-blue focus:ring-signal-blue/10"
          />
          <span className="text-sm text-graphite">Verified Only</span>
        </label>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState
          title="No matches yet"
          description="Generate recommendations to see ranked promoter matches based on audience fit."
          action={
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-signal-blue text-white rounded-button px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Recommendations"}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {data.items.map((match) => (
              <MatchResultsCard key={match.id} match={match} onInvite={handleInvite} />
            ))}
            {data.pages > 1 && (
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-sm font-medium transition-colors rounded-inputs ${
                      p === page
                        ? "bg-signal-blue text-white"
                        : "text-ash hover:bg-sky-wash hover:text-graphite"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-4">
            {data.items[0] && (
              <MatchBreakdownCard breakdown={data.items[0].score_breakdown} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
