import { Link } from "react-router-dom";
import { useAdminAnalytics } from "../features/analytics/api";
import { useAdminActivity } from "../features/activity/api";
import { ActivityCard } from "../components/ui/ActivityCard";
import { Activity } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminDashboardPage() {
  const { data: analytics, isLoading, error } = useAdminAnalytics();
  const { data: activityData, isLoading: activityLoading } = useAdminActivity({ size: 10 });

  if (error) return <div className="text-center py-12"><p className="text-danger">Error loading data</p><p className="text-gray-500 text-sm">{(error as Error).message}</p></div>;
  if (isLoading) return <LoadingSpinner />;

  const cards = [
    { label: "Total Users", value: analytics?.summary?.users ?? 0, color: "bg-blue-500" },
    { label: "Businesses", value: analytics?.summary?.businesses ?? 0, color: "bg-green-500" },
    { label: "Promoters", value: analytics?.summary?.promoters ?? 0, color: "bg-purple-500" },
    { label: "Verified Users", value: analytics?.summary?.verified_users ?? 0, color: "bg-teal-500" },
    { label: "Campaigns", value: analytics?.summary?.campaigns ?? 0, color: "bg-orange-500" },
    { label: "Collaborations", value: analytics?.summary?.collaborations ?? 0, color: "bg-pink-500" },
    { label: "Reviews", value: analytics?.summary?.reviews ?? 0, color: "bg-indigo-500" },
    { label: "Applications", value: analytics?.summary?.applications ?? 0, color: "bg-yellow-500" },
    { label: "Active Users", value: analytics?.summary?.active_users ?? 0, color: "bg-red-500" },
  ];

  const quickLinks = [
    { to: "/admin/users", label: "User Management" },
    { to: "/admin/verification-requests", label: "Verification Requests" },
    { to: "/admin/campaigns", label: "Campaign Moderation" },
    { to: "/admin/reviews", label: "Review Moderation" },
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/audit-logs", label: "Audit Logs" },
    { to: "/admin/settings", label: "Platform Settings" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-white p-4" aria-label={`${card.label}: ${card.value}`}>
            <div className={`h-2 w-12 rounded ${card.color}`} />
            <p className="mt-3 text-2xl font-bold text-text">
              {card.value}
            </p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-text">Quick Links</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded border px-4 py-3 text-center text-sm font-medium text-text hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-text">Platform Activity</h2>
        </div>
        {activityLoading ? (
          <div className="py-8 flex justify-center"><LoadingSpinner /></div>
        ) : !activityData?.items?.length ? (
          <p className="text-sm text-gray-500">No recent activity.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {activityData.items.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
