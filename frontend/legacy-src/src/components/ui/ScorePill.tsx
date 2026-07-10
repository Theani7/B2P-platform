interface ScorePillProps {
  score: number;
  className?: string;
}

function getScoreColors(score: number) {
  if (score >= 85) return "bg-emerald-status/10 text-emerald-status";
  if (score >= 70) return "bg-amber-tag/10 text-amber-tag";
  return "bg-sky-wash text-ash";
}

export function ScorePill({ score, className = "" }: ScorePillProps) {
  return (
    <span className={`rounded-badges px-1.5 py-0.5 text-xs font-medium ${getScoreColors(score)} ${className}`}>
      {score}
    </span>
  );
}
