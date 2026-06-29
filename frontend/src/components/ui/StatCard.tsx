import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
  icon?: LucideIcon;
}

export function StatCard({ label, value, subtitle, trend, className = "", icon: Icon }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-stone-100 border-t-[1px] border-t-brand-purple p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-stone-900">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-full bg-brand-purple-50 flex items-center justify-center text-brand-purple">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-medium text-stone-900 font-stretch-condensed">{value}</h3>
      </div>
      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`inline-flex items-center gap-1 font-medium ${trend.positive ? "text-brand-teal-900 bg-brand-teal-50" : "text-brand-coral-900 bg-brand-coral-50"} px-2 py-0.5 rounded-full`}>
              {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-stone-900">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}