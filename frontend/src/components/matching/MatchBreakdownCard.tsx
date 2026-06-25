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
    <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
      <h3 className="text-base font-medium text-gray-900">Score Breakdown</h3>
      {(Object.keys(breakdownLabels) as (keyof ScoreBreakdown)[]).map((key) => {
        const score = breakdown[key];
        const max = breakdownMax[key];
        const pct = max > 0 ? (score / max) * 100 : 0;
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">{breakdownLabels[key]}</span>
              <span className="font-medium text-gray-900">
                {score}/{max}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-100">
              <div
                className="h-1 rounded-full bg-brand-teal transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
