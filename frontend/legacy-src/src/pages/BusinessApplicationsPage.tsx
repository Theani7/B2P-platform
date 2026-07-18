import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaignApplications, useAcceptApplication, useRejectApplication } from "../features/collaboration/api";
import { useCampaignMatches } from "../features/matching/api";
import { useCampaign } from "../features/campaigns/api";
import { formatCompactNumber } from "../utils/number";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader, Avatar, Badge, Dialog } from "../components/ui";
import { Table, TableColumn } from "../components/ui/Table";
import MatchBreakdownCard from "../components/matching/MatchBreakdownCard";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Briefcase,
  Eye,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  Star
} from "lucide-react";

export default function BusinessApplicationsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [page, setPage] = useState(1);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const { data: campaign } = useCampaign(campaignId ?? "");
  const { data, isLoading, error } = useCampaignApplications(campaignId ?? "", { page, limit: 20 });
  const { data: matchesData } = useCampaignMatches(campaignId ?? "", { limit: 100 });
  
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();
  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-cards bg-coral-alert/10 flex items-center justify-center mb-4">
        <XCircle size={32} className="text-coral-alert" />
      </div>
      <p className="text-lg font-medium text-graphite">Error loading applications</p>
      <p className="text-sm text-ash mt-1">{(error as Error).message}</p>
    </div>
  );

  const handleAccept = (id: string) => {
    acceptMutation.mutate(id, {
      onSuccess: () => {
        notifySuccess("Application accepted — collaboration created!");
        setSelectedAppId(null);
      },
      onError: (e) => notifyError(e.message),
    });
  };

  const handleReject = (id: string) => {
    setRejectConfirm(id);
  };

  const confirmReject = () => {
    if (!rejectConfirm) return;
    rejectMutation.mutate(rejectConfirm, {
      onSuccess: () => { 
        notifySuccess("Application rejected"); 
        setRejectConfirm(null); 
        setSelectedAppId(null);
      },
      onError: (e) => { notifyError(e.message); setRejectConfirm(null); },
    });
  };

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.items.length === 0) {
    return (
      <div className="space-y-6">
        <Link to="/business/campaigns" className="text-xs text-signal-blue hover:underline inline-flex items-center gap-1 font-medium mb-3">
          &larr; Back to Campaigns
        </Link>
        <EmptyState
          title="No applications yet"
          description="Promoters haven't applied to this campaign yet. Try promoting it more or inviting specific promoters."
          action={
            <Link to="/business/campaigns" className="inline-flex items-center gap-2 bg-signal-blue text-white rounded-button px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              <ArrowLeft size={16} />
              Back to Campaigns
            </Link>
          }
        />
      </div>
    );
  }

  const items = data.items as any[];
  const selectedApp = items.find(app => app.id === selectedAppId);
  const promoterMatch = selectedApp ? matchesData?.items?.find(m => m.promoter.id === selectedApp.promoter_profile_id) : null;

  const columns: TableColumn<any>[] = [
    {
      key: "promoter",
      header: "Promoter",
      render: (app) => (
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {app.promoter_avatar_url ? (
              <img src={app.promoter_avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <Avatar initials={app.promoter_username?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={app.id?.charCodeAt(0) || 0} />
            )}
            {app.promoter_verified && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-status flex items-center justify-center ring-2 ring-white">
                <BadgeCheck size={10} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-graphite">{app.promoter_username}</h3>
              {app.promoter_verified && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-badges text-[10px] font-medium bg-emerald-status/10 text-emerald-status">
                  <BadgeCheck size={10} />
                  Verified
                </span>
              )}
            </div>
            {app.promoter_headline && (
              <p className="text-xs text-ash mt-0.5">{app.promoter_headline}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: "stats",
      header: "Stats",
      render: (app) => (
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] text-graphite">
            <Briefcase size={10} className="text-signal-blue" />
            {app.promoter_niche}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-ash">
            <Users size={10} className="text-fog" />
            {formatCompactNumber(app.promoter_followers_count)} followers
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-status font-medium">
            <TrendingUp size={10} />
            {app.promoter_engagement_rate?.toFixed(1)}% eng.
          </span>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (app) => {
        const badgeVariant =
          app.status === "PENDING"
            ? "pending"
            : app.status === "ACCEPTED"
            ? "verified"
            : app.status === "REJECTED"
            ? "rejected"
            : "draft";
        return <Badge variant={badgeVariant}>{app.status}</Badge>;
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (app) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedAppId(app.id)}
            className="text-xs text-signal-blue hover:underline flex items-center gap-1 font-medium ml-auto"
          >
            <Eye size={14} />
            View Application & Match
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/business/campaigns" className="text-xs text-signal-blue hover:underline inline-flex items-center gap-1 font-medium mb-3">
          &larr; Back to Campaigns
        </Link>
        <PageHeader
          title="Applications"
          description={`${data.total} applicant${data.total !== 1 ? 's' : ''} found for this campaign.`}
        />
      </div>

      {/* Applications List */}
      <Table columns={columns} data={items} />

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 rounded-inputs border border-slate-custom/10 px-3 py-1.5 text-xs font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors"
          >
            <ArrowLeft size={12} />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-inputs text-xs font-medium transition-colors ${
                  p === page
                    ? "bg-signal-blue text-white"
                    : "text-ash hover:bg-sky-wash"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page >= data.pages}
            className="inline-flex items-center gap-1.5 rounded-inputs border border-slate-custom/10 px-3 py-1.5 text-xs font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors"
          >
            Next
            <ArrowLeft size={12} className="rotate-180" />
          </button>
        </div>
      )}

      {/* Application Review Dialog */}
      <Dialog
        isOpen={!!selectedAppId}
        onClose={() => setSelectedAppId(null)}
        title="Application Review"
        size="lg"
        footer={
          selectedApp?.status === "PENDING" && (
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                onClick={() => handleReject(selectedApp.id)}
                disabled={rejectMutation.isPending}
                className="bg-white border border-coral-alert/20 text-coral-alert rounded-inputs px-6 py-2.5 text-sm font-bold hover:bg-coral-alert/10 disabled:opacity-50 shadow-sm"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </button>
              <button
                onClick={() => handleAccept(selectedApp.id)}
                disabled={acceptMutation.isPending}
                className="bg-signal-blue text-white rounded-inputs px-6 py-2.5 text-sm font-bold hover:bg-signal-blue/90 disabled:opacity-50 shadow-sm"
              >
                {acceptMutation.isPending ? "Accepting..." : "Accept Application"}
              </button>
            </div>
          )
        }
      >
        {selectedApp && (
          <div className="space-y-8 pb-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Promoter Info */}
            <div className="flex items-center gap-4">
              {selectedApp.promoter_avatar_url ? (
                <img src={selectedApp.promoter_avatar_url} alt="" className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-slate-custom/5" />
              ) : (
                <Avatar initials={selectedApp.promoter_username?.[0]?.toUpperCase() ?? "?"} size="lg" className="w-16 h-16" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-graphite">{selectedApp.promoter_username}</h3>
                  {selectedApp.promoter_verified && (
                    <BadgeCheck size={16} className="text-emerald-status" />
                  )}
                </div>
                <p className="text-sm text-ash">{selectedApp.promoter_headline}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs font-bold text-fog uppercase tracking-wide">{selectedApp.promoter_niche}</span>
                  <span className="text-xs text-ash">•</span>
                  <span className="text-xs text-graphite font-medium">{formatCompactNumber(selectedApp.promoter_followers_count)} Followers</span>
                </div>
              </div>
            </div>

            {/* Application Message */}
            <div className="bg-linen-canvas/50 border border-slate-custom/10 rounded-xl p-5">
              <h4 className="text-xs font-bold text-ash uppercase tracking-wider mb-2">Message to Business</h4>
              {selectedApp.message ? (
                <p className="text-sm text-graphite leading-relaxed whitespace-pre-wrap italic">"{selectedApp.message}"</p>
              ) : (
                <p className="text-sm text-ash italic">No message provided.</p>
              )}
            </div>

            {/* Match Score */}
            <div>
              <h4 className="text-sm font-bold text-graphite mb-3 flex items-center gap-2">
                <Star size={16} className="text-signal-blue" />
                Promoter Fit Analysis
              </h4>
              {(() => {
                // If we have backend match, use it. Otherwise, compute instantly on frontend.
                let matchData = promoterMatch;
                
                if (!matchData && campaign) {
                  let score = 0;
                  const breakdown: any = { niche: 0, location: 0, followers: 0, experience: 0, engagement: 0 };
                  
                  // Niche
                  const cCat = (campaign.category || "").toUpperCase();
                  const pCat = (selectedApp.promoter_niche || "").toUpperCase();
                  if (cCat === pCat) { score += 40; breakdown.niche = 40; }
                  else {
                    const related: Record<string, string[]> = {
                      "LIFESTYLE": ["FASHION", "TRAVEL", "FOOD", "FITNESS"],
                      "TECH": ["GAMING", "BUSINESS"],
                      "FASHION": ["LIFESTYLE"],
                      "FOOD": ["LIFESTYLE", "TRAVEL"],
                      "TRAVEL": ["LIFESTYLE", "FOOD"],
                      "FITNESS": ["LIFESTYLE"],
                      "GAMING": ["TECH"],
                      "BUSINESS": ["TECH"],
                    };
                    if (related[cCat]?.includes(pCat)) { score += 20; breakdown.niche = 20; }
                  }
                  
                  // Location
                  const cLoc = (campaign.location || "").toLowerCase();
                  const pLoc = (selectedApp.promoter_location || "").toLowerCase();
                  if (pLoc && cLoc === pLoc) { score += 20; breakdown.location = 20; }
                  
                  // Followers
                  const fols = selectedApp.promoter_followers_count || 0;
                  if (fols >= 100000) { score += 15; breakdown.followers = 15; }
                  else if (fols >= 50000) { score += 10; breakdown.followers = 10; }
                  else if (fols >= 10000) { score += 5; breakdown.followers = 5; }
                  
                  // Experience
                  const exp = selectedApp.promoter_years_experience || 0;
                  if (exp >= 5) { score += 10; breakdown.experience = 10; }
                  else if (exp >= 3) { score += 7; breakdown.experience = 7; }
                  else if (exp >= 1) { score += 5; breakdown.experience = 5; }
                  
                  // Engagement
                  const eng = selectedApp.promoter_engagement_rate || 0;
                  if (eng >= 10.0) { score += 15; breakdown.engagement = 15; }
                  else if (eng >= 5.0) { score += 10; breakdown.engagement = 10; }
                  else if (eng >= 2.0) { score += 5; breakdown.engagement = 5; }
                  
                  let classification = "LOW_MATCH";
                  if (score >= 90) classification = "EXCELLENT_MATCH";
                  else if (score >= 70) classification = "GOOD_MATCH";
                  else if (score >= 50) classification = "AVERAGE_MATCH";
                  
                  matchData = {
                    score,
                    classification,
                    score_breakdown: breakdown,
                    explanation: ""
                  };
                }

                if (!matchData) return null;

                return (
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-custom/10 rounded-xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-fog uppercase tracking-wider">Match Score</p>
                        <p className="text-xs text-ash mt-1">{matchData.classification.replace(/_/g, " ")}</p>
                      </div>
                      <div className="text-3xl font-bold text-signal-blue">
                        {Math.round(matchData.score)}<span className="text-lg text-ash">/100</span>
                      </div>
                    </div>
                    <MatchBreakdownCard breakdown={matchData.score_breakdown} />
                    {matchData.explanation && (
                      <p className="text-sm text-graphite leading-relaxed">{matchData.explanation}</p>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>
        )}
      </Dialog>

      <ConfirmDialog
        isOpen={!!rejectConfirm}
        onClose={() => setRejectConfirm(null)}
        onConfirm={confirmReject}
        title="Reject Application"
        message="Are you sure you want to reject this application? This action cannot be undone."
      />
    </div>
  );
}
