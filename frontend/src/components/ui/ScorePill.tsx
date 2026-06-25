interface ScorePillProps {
  score: number;
  className?: string;
}

function getScoreColors(score: number) {
  if (score >= 85) return "bg-brand-teal-50 text-brand-teal-900";
  if (score >= 70) return "bg-brand-amber-50 text-brand-amber-900";
  return "bg-gray-100 text-gray-500";
}

export function ScorePill({ score, className = "" }: ScorePillProps) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getScoreColors(score)} ${className}`}>
      {score}
    </span>
  );
}