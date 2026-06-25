import { useAdminAnalytics } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAdminAnalytics();

  if (error) return <div className="text-center py-12"><p className="text-danger">Error loading data</p><p className="text-gray-500 text-sm">{(error as Error).message}</p></div>;
  if (isLoading) return <LoadingSpinner />;

  const kpiCards = [
    { label: "Total Users", value: data?.total_users ?? 0 },
    { label: "Businesses", value: data?.total_businesses ?? 0 },
    { label: "Promoters", value: data?.total_promoters ?? 0 },
    { label: "Verified Promoters", value: data?.verified_promoters ?? 0 },
    { label: "Campaigns", value: data?.total_campaigns ?? 0 },
    { label: "Collaborations", value: data?.total_collaborations ?? 0 },
    { label: "Reviews", value: data?.total_reviews ?? 0 },
    { label: "Acceptance Rate", value: data?.acceptance_rate ?? 0, suffix: "%" },
    { label: "Avg Rating", value: data?.average_rating ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {kpiCards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-white p-4">
            <p className="text-2xl font-bold text-text">{card.value}{card.suffix || ""}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {data?.top_niches && Object.keys(data.top_niches).length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-text">Top Niches</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(data.top_niches).slice(0, 10).map(([niche, count]) => {
              const total = Object.values(data.top_niches!).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={niche} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-600">{niche}</span>
                  <div className="h-4 flex-1 rounded-full bg-gray-200">
                    <div className="h-4 rounded-full bg-primary" style={{ width: `${pct}%` }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} />
                  </div>
                  <span className="w-12 text-right text-sm text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data?.top_locations && Object.keys(data.top_locations).length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-text">Top Campaign Locations</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(data.top_locations).slice(0, 10).map(([location, count]) => (
              <div key={location} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{location}</span>
                <span className="font-medium text-text">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
