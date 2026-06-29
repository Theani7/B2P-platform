import { Link } from "react-router-dom";
import { useAdminDashboard } from "../features/admin/api";
import { useAdminActivity } from "../features/activity/api";
import { ActivityCard } from "../components/ui/ActivityCard";
import { Activity, Users, Building2, Megaphone, CheckCircle, Target, Briefcase, Star, FileText } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { StatCard } from "../components/ui/StatCard";

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading, error } = useAdminDashboard();
  const { data: activityData, isLoading: activityLoading } = useAdminActivity({ size: 10 });

  if (error) return <div className="text-center py-12"><p className="text-coral-alert">Error loading data</p><p className="text-sm text-ash">{(error as Error).message}</p></div>;
  if (isLoading) return <LoadingSpinner />;

  const cards = [
    { label: "Total Users", value: dashboard?.total_users ?? 0, icon: Users },
    { label: "Businesses", value: dashboard?.total_businesses ?? 0, icon: Building2 },
    { label: "Promoters", value: dashboard?.total_promoters ?? 0, icon: Megaphone },
    { label: "Verified Promoters", value: dashboard?.verified_promoters ?? 0, icon: CheckCircle },
    { label: "Campaigns", value: dashboard?.total_campaigns ?? 0, icon: Target },
    { label: "Collaborations", value: dashboard?.total_collaborations ?? 0, icon: Briefcase },
    { label: "Reviews", value: dashboard?.total_reviews ?? 0, icon: Star },
    { label: "Applications", value: dashboard?.total_applications ?? 0, icon: FileText },
    { label: "Verification Requests", value: dashboard?.open_verification_requests ?? 0, icon: CheckCircle },
  ];

  const quickLinks = [
    { to: "/admin/users", label: "Users" },
    { to: "/admin/verification", label: "Verification" },
    { to: "/admin/campaigns", label: "Campaigns" },
    { to: "/admin/reviews", label: "Reviews" },
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/audit-logs", label: "Audit Logs" },
    { to: "/admin/settings", label: "Settings" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <h1 className="text-heading text-midnight-ink">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
        ))}
      </div>

      <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card">
        <h2 className="text-heading text-graphite p-5">Quick Links</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7 p-5 pt-0">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center justify-center gap-2 rounded-cards border border-slate-custom/10 bg-linen-canvas p-4 text-center text-sm font-medium text-graphite hover:border-signal-blue/30 hover:bg-sky-wash transition-all"
            >
              <span className="text-xs">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card">
        <div className="flex items-center gap-2 p-5">
          <Activity size={18} className="text-graphite" />
          <h2 className="text-heading text-graphite">Platform Activity</h2>
        </div>
        {activityLoading ? (
          <div className="py-8 flex justify-center"><LoadingSpinner /></div>
        ) : !activityData?.items?.length ? (
          <p className="text-sm text-ash p-5 pt-0">No recent activity.</p>
        ) : (
          <div className="divide-y divide-slate-custom/10">
            {activityData.items.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
