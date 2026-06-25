import { Link } from "react-router-dom";
import { useCampaignDashboardStats } from "../features/campaigns/api";
import StatusBadge from "../components/StatusBadge";

export default function BusinessDashboard() {
  const { data: stats, isLoading, error } = useCampaignDashboardStats();

  if (error) return <div className="text-center py-12"><p className="text-danger">Error loading data</p><p className="text-gray-500 text-sm">{(error as Error).message}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Business Dashboard</h1>
        <Link
          to="/business/campaigns"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          View All Campaigns
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4" aria-live="polite">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Total Campaigns</p>
          <p className="mt-1 text-2xl font-bold text-text">
            {isLoading ? "-" : stats?.total_campaigns ?? 0}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Open</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {isLoading ? "-" : stats?.open_campaigns ?? 0}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {isLoading ? "-" : stats?.active_campaigns ?? 0}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-purple-600">
            {isLoading ? "-" : stats?.completed_campaigns ?? 0}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold text-text">Recent Campaigns</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : !stats?.recent_campaigns?.length ? (
          <div className="p-8 text-center text-gray-500">
            No campaigns yet.
            <Link
              to="/business/campaigns/create"
              className="ml-1 text-primary hover:underline"
            >
              Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {stats.recent_campaigns.map((c) => (
              <Link
                key={c.id}
                to={`/business/campaigns/${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-text">{c.title}</p>
                  <p className="text-sm text-gray-500">
                    ${c.budget.toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
