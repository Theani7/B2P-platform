import type { MatchResultRead } from "../../features/matching/types";

const CLASSIFICATION_STYLES: Record<string, string> = {
  EXCELLENT_MATCH: "bg-green-100 text-green-800",
  GOOD_MATCH: "bg-blue-100 text-blue-800",
  AVERAGE_MATCH: "bg-yellow-100 text-yellow-800",
  LOW_MATCH: "bg-gray-100 text-gray-600",
};

interface MatchResultsCardProps {
  match: MatchResultRead;
  onInvite?: (promoterId: string) => void;
}

export default function MatchResultsCard({ match, onInvite }: MatchResultsCardProps) {
  const scoreColor =
    match.score >= 90
      ? "text-green-600"
      : match.score >= 70
        ? "text-blue-600"
        : match.score >= 50
          ? "text-yellow-600"
          : "text-gray-500";

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {match.promoter.avatar_url ? (
              <img src={match.promoter.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              match.promoter.username.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-semibold text-text">{match.promoter.username}</h3>
            {match.promoter.headline && (
              <p className="text-sm text-gray-500">{match.promoter.headline}</p>
            )}
            <p className="text-xs text-gray-400">{match.promoter.niche}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className={`text-2xl font-bold ${scoreColor}`}>{Math.round(match.score)}</div>
            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${CLASSIFICATION_STYLES[match.classification] || ""}`}>
              {match.classification.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span>{match.promoter.followers_count.toLocaleString()} followers</span>
        <span>{match.promoter.engagement_rate}% engagement</span>
        {match.promoter.years_experience != null && <span>{match.promoter.years_experience} yrs exp</span>}
        {match.promoter.location && <span>{match.promoter.location}</span>}
        {match.promoter.verified && <span className="text-green-600 font-medium">Verified</span>}
      </div>

      <p className="text-sm text-gray-600 italic">{match.explanation}</p>

      {onInvite && (
        <button
          onClick={() => onInvite(match.promoter.id)}
          className="rounded bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          Invite
        </button>
      )}
    </div>
  );
}
