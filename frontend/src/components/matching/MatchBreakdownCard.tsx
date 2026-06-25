import type { ScoreBreakdown } from "../../features/matching/types";

interface MatchBreakdownCardProps {
  breakdown: ScoreBreakdown;
}

const breakdownLabels: Record<keyof ScoreBreakdown, string> = {
  niche: "Niche Match",
  location: "Location Match",
  followers: "Followers Score",
  experience: "Experience Score",
  engagement: "Engagement Score",
};

const breakdownMax: Record<keyof ScoreBreakdown, number> = {
  niche: 40,
  location: 20,
  followers: 15,
  experience: 10,
  engagement: 15,
};

export default function MatchBreakdownCard({ breakdown }: MatchBreakdownCardProps) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="font-semibold text-text">Score Breakdown</h3>
      {(Object.keys(breakdownLabels) as (keyof ScoreBreakdown)[]).map((key) => {
        const score = breakdown[key];
        const max = breakdownMax[key];
        const pct = max > 0 ? (score / max) * 100 : 0;
        return (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{breakdownLabels[key]}</span>
              <span className="font-medium text-text">
                {score}/{max}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
