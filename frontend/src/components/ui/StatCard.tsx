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
    <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {Icon && (
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold tracking-tight text-gray-900">{value}</h3>
      </div>
      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {trend && (
            <span className={`inline-flex items-center gap-1 font-medium ${trend.positive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"} px-2 py-0.5 rounded-full text-xs`}>
              {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-gray-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}