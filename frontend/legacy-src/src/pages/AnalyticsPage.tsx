import { useAdminAnalytics } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { Briefcase, Star, Percent, Target, MapPin, BadgeCheck } from "lucide-react";

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAdminAnalytics();

  if (error) return <div className="text-center py-12"><p className="text-coral-alert">Error loading analytics data</p></div>;
  if (isLoading) return <LoadingSpinner />;

  // Calculate insights
  const verifiedPct = data?.total_promoters ? Math.round(((data?.verified_promoters || 0) / data.total_promoters) * 100) : 0;
  
  const metricCards = [
    { label: "Acceptance Rate", value: `${data?.acceptance_rate ?? 0}%`, icon: Percent, color: "text-signal-blue", bg: "bg-sky-wash" },
    { label: "Avg Platform Rating", value: (data?.average_rating ?? 0).toFixed(1), icon: Star, color: "text-amber-tag", bg: "bg-amber-tag/10" },
    { label: "Total Collaborations", value: data?.total_collaborations ?? 0, icon: Briefcase, color: "text-emerald-status", bg: "bg-emerald-status/10" },
    { label: "Verified Promoters", value: `${verifiedPct}%`, icon: BadgeCheck, color: "text-azure-info", bg: "bg-azure-info/10" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-heading text-midnight-ink">Platform Analytics</h1>
        <p className="text-body text-ash mt-1">Deep insights into platform growth and user engagement.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-5 flex flex-col gap-3 hover:border-signal-blue/30 transition-all">
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-cards ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-heading text-graphite">{stat.value}</p>
              <p className="text-caption text-ash uppercase tracking-wide mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data?.top_niches && Object.keys(data.top_niches).length > 0 && (
          <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden">
             <div className="p-5 border-b border-slate-custom/10 bg-linen-canvas">
               <h2 className="text-heading-sm text-graphite flex items-center gap-2">
                 <Target size={18} className="text-signal-blue" />
                 Top Performing Niches
               </h2>
             </div>
            <div className="p-6 space-y-5">
              {Object.entries(data.top_niches).slice(0, 5).map(([niche, count]) => {
                const total = Object.values(data.top_niches!).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={niche}>
                    <div className="flex justify-between text-body mb-1.5">
                      <span className="font-medium text-graphite">{niche}</span>
                      <span className="text-caption text-ash">{count} campaigns</span>
                    </div>
                    <div className="h-1.5 w-full rounded-pill bg-sky-wash overflow-hidden">
                      <div className="h-full rounded-pill bg-signal-blue transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data?.top_locations && Object.keys(data.top_locations).length > 0 && (
          <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden">
             <div className="p-5 border-b border-slate-custom/10 bg-linen-canvas">
               <h2 className="text-heading-sm text-graphite flex items-center gap-2">
                 <MapPin size={18} className="text-azure-info" />
                 Campaign Geography
               </h2>
             </div>
            <div className="p-6 divide-y divide-slate-custom/10">
              {Object.entries(data.top_locations).slice(0, 6).map(([location, count]) => (
                <div key={location} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-cards bg-azure-info/10 flex items-center justify-center">
                       <span className="text-caption font-medium uppercase tracking-wide text-azure-info">{location.substring(0,2)}</span>
                     </div>
                    <span className="text-body font-medium text-graphite">{location}</span>
                  </div>
                  <span className="text-body font-medium text-graphite">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
