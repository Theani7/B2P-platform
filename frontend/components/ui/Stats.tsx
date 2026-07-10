import { type ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  subtitle?: string;
  hint?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
  icon?: LucideIcon;
}

export function StatCard({ label, value, subtitle, hint, trend, className = "", icon: Icon }: StatCardProps) {
  const displaySubtitle = subtitle || hint;

  return (
    <div className={`bg-white border border-slate-custom/10 rounded-cards p-5 shadow-product-card ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-caption font-medium uppercase tracking-wider text-ash">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-full bg-sky-wash flex items-center justify-center text-signal-blue">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-semibold text-midnight-ink tracking-tight">{value}</h3>
      </div>
      {(trend || displaySubtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-badges ${
                trend.positive
                  ? "text-emerald-status bg-emerald-status/10"
                  : "text-coral-alert bg-coral-alert/10"
              }`}
            >
              {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.value}
            </span>
          )}
          {displaySubtitle && <span className="text-ash">{displaySubtitle}</span>}
        </div>
      )}
    </div>
  );
}
