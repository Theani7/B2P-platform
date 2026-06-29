import { useAdminAnalytics } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { StatCard } from "../components/ui/StatCard";
import { Users, Building2, Megaphone, CheckCircle, Target, Briefcase, Star, Percent } from "lucide-react";

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAdminAnalytics();

  if (error) return <div className="text-center py-12"><p className="text-coral-alert">Error loading data</p><p className="text-xs text-ash">{(error as Error).message}</p></div>;
  if (isLoading) return <LoadingSpinner />;

  const kpiCards = [
    { label: "Total Users", value: data?.total_users ?? 0, icon: Users },
    { label: "Businesses", value: data?.total_businesses ?? 0, icon: Building2 },
    { label: "Promoters", value: data?.total_promoters ?? 0, icon: Megaphone },
    { label: "Verified Promoters", value: data?.verified_promoters ?? 0, icon: CheckCircle },
    { label: "Campaigns", value: data?.total_campaigns ?? 0, icon: Target },
    { label: "Collaborations", value: data?.total_collaborations ?? 0, icon: Briefcase },
    { label: "Reviews", value: data?.total_reviews ?? 0, icon: Star },
    { label: "Acceptance Rate", value: `${data?.acceptance_rate ?? 0}%`, icon: Percent },
    { label: "Avg Rating", value: data?.average_rating ?? 0, icon: Star },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-heading text-graphite">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
        ))}
      </div>

      {data?.top_niches && Object.keys(data.top_niches).length > 0 && (
        <div className="rounded-cards border border-slate-custom/10 bg-white p-5">
          <h2 className="text-heading text-graphite">Top Niches</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(data.top_niches).slice(0, 10).map(([niche, count]) => {
              const total = Object.values(data.top_niches!).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={niche} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-graphite">{niche}</span>
                  <div className="h-4 flex-1 rounded-full bg-sky-wash">
                    <div className="h-4 rounded-full bg-emerald-status" style={{ width: `${pct}%` }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} />
                  </div>
                  <span className="w-12 text-right text-sm text-ash">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data?.top_locations && Object.keys(data.top_locations).length > 0 && (
        <div className="rounded-cards border border-slate-custom/10 bg-white p-5">
          <h2 className="text-heading text-graphite">Top Campaign Locations</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(data.top_locations).slice(0, 10).map(([location, count]) => (
              <div key={location} className="flex items-center justify-between text-sm">
                <span className="text-graphite">{location}</span>
                <span className="font-medium text-graphite">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
