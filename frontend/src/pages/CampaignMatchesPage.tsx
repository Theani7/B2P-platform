import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaignMatches, useGenerateMatches } from "../features/matching/api";
import { useInvitePromoter } from "../features/collaboration/api";
import MatchResultsCard from "../components/matching/MatchResultsCard";
import MatchBreakdownCard from "../components/matching/MatchBreakdownCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
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
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/business/campaigns/${campaignId}`} className="text-sm text-primary hover:underline">
            &larr; Back to Campaign
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-text">Recommended Promoters</h1>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Recommendations"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <div>
          <label className="mr-2 text-sm text-gray-600">Classification</label>
          <select
            value={filterClassification}
            onChange={(e) => { setFilterClassification(e.target.value as FilterKey); setPage(1); }}
            className="rounded border px-3 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="EXCELLENT_MATCH">Excellent</option>
            <option value="GOOD_MATCH">Good</option>
            <option value="AVERAGE_MATCH">Average</option>
            <option value="LOW_MATCH">Low</option>
          </select>
        </div>
        <div>
          <label className="mr-2 text-sm text-gray-600">Min Score</label>
          <select
            value={minScore ?? ""}
            onChange={(e) => { setMinScore(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className="rounded border px-3 py-1.5 text-sm"
          >
            <option value="">Any</option>
            <option value="90">90+</option>
            <option value="70">70+</option>
            <option value="50">50+</option>
          </select>
        </div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Verified Only</span>
        </label>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState
          title="No matches yet"
          description="Generate recommendations to see ranked promoter matches."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {data.items.map((match) => (
              <MatchResultsCard key={match.id} match={match} onInvite={handleInvite} />
            ))}
            {data.pages > 1 && (
              <div className="flex justify-center space-x-2">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded px-3 py-1 text-sm ${p === page ? "bg-primary text-white" : "border text-gray-600 hover:bg-gray-50"}`}
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
