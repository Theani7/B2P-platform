interface ProgressBarProps {
  percentage: number;
  className?: string;
}

export function ProgressBar({ percentage, className = "" }: ProgressBarProps) {
  return (
    <div className={`bg-sky-wash rounded-full h-1 ${className}`}>
      <div
        className="bg-emerald-status rounded-full h-1 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
}
