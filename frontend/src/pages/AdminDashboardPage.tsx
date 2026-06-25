import { Link } from "react-router-dom";
import { useAdminDashboard } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  if (error) return <div className="text-center py-12"><p className="text-danger">Error loading data</p><p className="text-gray-500 text-sm">{(error as Error).message}</p></div>;
  if (isLoading) return <LoadingSpinner />;

  const cards = [
    { label: "Total Users", value: data?.total_users ?? 0, color: "bg-blue-500" },
    { label: "Businesses", value: data?.total_businesses ?? 0, color: "bg-green-500" },
    { label: "Promoters", value: data?.total_promoters ?? 0, color: "bg-purple-500" },
    { label: "Verified", value: data?.verified_promoters ?? 0, color: "bg-teal-500" },
    { label: "Campaigns", value: data?.total_campaigns ?? 0, color: "bg-orange-500" },
    { label: "Collaborations", value: data?.total_collaborations ?? 0, color: "bg-pink-500" },
    { label: "Reviews", value: data?.total_reviews ?? 0, color: "bg-indigo-500" },
    { label: "Avg Rating", value: data?.average_rating ?? 0, color: "bg-yellow-500", decimals: 1 },
    { label: "Verification Queue", value: data?.open_verification_requests ?? 0, color: "bg-red-500" },
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
          <div key={card.label} className="rounded-lg border bg-white p-4" aria-label={`${card.label}: ${typeof card.value === "number" && card.decimals ? card.value.toFixed(card.decimals) : card.value}`}>
            <div className={`h-2 w-12 rounded ${card.color}`} />
            <p className="mt-3 text-2xl font-bold text-text">
              {typeof card.value === "number" && card.decimals ? card.value.toFixed(card.decimals) : card.value}
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
    </div>
  );
}
