interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, subtitle, trend, className = "" }: StatCardProps) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-5 ${className}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-2xl font-medium text-gray-900 mt-1">{value}</div>
      <div className="flex items-center gap-2 mt-0.5">
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
        {trend && (
          <span className={`text-xs font-medium ${trend.positive ? "text-brand-teal" : "text-brand-coral"}`}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}