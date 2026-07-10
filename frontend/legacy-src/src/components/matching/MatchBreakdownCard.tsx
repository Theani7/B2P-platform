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
    <div className="bg-white border border-slate-custom/10 rounded-cards p-5 space-y-4">
      <h3 className="text-heading text-graphite">Score Breakdown</h3>
      {(Object.keys(breakdownLabels) as (keyof ScoreBreakdown)[]).map((key) => {
        const score = breakdown[key];
        const max = breakdownMax[key];
        const pct = max > 0 ? (score / max) * 100 : 0;
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-ash">{breakdownLabels[key]}</span>
              <span className="font-medium text-graphite">
                {score}/{max}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-sky-wash">
              <div
                className="h-1 rounded-full bg-emerald-status transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
