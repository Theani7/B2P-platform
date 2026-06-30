import type { MatchResultRead } from "../../features/matching/types";
import { Star } from "lucide-react";
import { formatCompactNumber } from "../../utils/number";

const CLASSIFICATION_STYLES: Record<string, string> = {
  EXCELLENT_MATCH: "bg-emerald-status/10 text-emerald-status",
  GOOD_MATCH: "bg-signal-blue/10 text-signal-blue",
  AVERAGE_MATCH: "bg-amber-tag/10 text-amber-tag",
  LOW_MATCH: "bg-sky-wash text-ash",
};

interface MatchResultsCardProps {
  match: MatchResultRead;
  onInvite?: (promoterId: string) => void;
}

export default function MatchResultsCard({ match, onInvite }: MatchResultsCardProps) {
  const scoreColor =
    match.score >= 85
      ? "text-emerald-status"
      : match.score >= 70
        ? "text-amber-tag"
        : "text-ash";

  return (
    <div className="bg-white border border-slate-custom/10 rounded-cards p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-signal-blue/10 flex items-center justify-center text-signal-blue font-medium text-lg">
            {match.promoter.avatar_url ? (
              <img src={match.promoter.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              match.promoter.username.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-graphite">{match.promoter.username}</h3>
            {match.promoter.headline && (
              <p className="text-xs text-ash">{match.promoter.headline}</p>
            )}
            <p className="text-xs text-fog">{match.promoter.niche}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className={`text-2xl font-medium ${scoreColor}`}>{Math.round(match.score)}</div>
            <span className={`inline-block rounded-badges px-1.5 py-0.5 text-xs font-medium ${CLASSIFICATION_STYLES[match.classification] || ""}`}>
              {match.classification.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-ash">
        <span>{formatCompactNumber(match.promoter.followers_count)} followers</span>
        <span>{match.promoter.engagement_rate}% engagement</span>
        {match.promoter.years_experience != null && <span>{match.promoter.years_experience} yrs exp</span>}
        {match.promoter.location && <span>{match.promoter.location}</span>}
        {match.promoter.verified && <span className="text-emerald-status font-medium">Verified</span>}
      </div>

      <p className="text-sm text-graphite leading-relaxed">{match.explanation}</p>

      {onInvite && (
        <button
          onClick={() => onInvite(match.promoter.id)}
          className="bg-signal-blue text-white rounded-button px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Invite
        </button>
      )}
    </div>
  );
}
