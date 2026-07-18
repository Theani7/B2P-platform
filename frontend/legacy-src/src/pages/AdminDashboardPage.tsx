import { Link } from "react-router-dom";
import { useAdminDashboard } from "../features/admin/api";
import { useAdminActivity } from "../features/activity/api";
import { ActivityCard } from "../components/ui/ActivityCard";
import { Activity, Users, Target, FileText, Settings, ShieldAlert, CheckCircle, BarChart3, ChevronRight } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading, error } = useAdminDashboard();
  const { data: activityData, isLoading: activityLoading } = useAdminActivity({ size: 10 });

  if (error) return <div className="text-center py-12"><p className="text-coral-alert">Error loading dashboard</p></div>;
  if (isLoading) return <LoadingSpinner />;

  const operationalStats = [
    { label: "Total Users", value: dashboard?.total_users ?? 0, icon: Users, color: "text-signal-blue", bg: "bg-sky-wash" },
    { label: "Total Campaigns", value: dashboard?.total_campaigns ?? 0, icon: Target, color: "text-emerald-status", bg: "bg-emerald-status/10" },
    { label: "Applications", value: dashboard?.total_applications ?? 0, icon: FileText, color: "text-azure-info", bg: "bg-azure-info/10" },
    { label: "Pending Verifications", value: dashboard?.open_verification_requests ?? 0, icon: ShieldAlert, color: "text-amber-tag", bg: "bg-amber-tag/10" },
  ];

  const quickActions = [
    { to: "/admin/verification", label: "Verify Promoters", desc: "Review pending KYC", icon: CheckCircle },
    { to: "/admin/users", label: "User Management", desc: "Manage accounts & roles", icon: Users },
    { to: "/admin/campaigns", label: "Campaign Moderation", desc: "Review active campaigns", icon: Target },
    { to: "/admin/analytics", label: "Platform Analytics", desc: "Deep data insights", icon: BarChart3 },
    { to: "/admin/settings", label: "Platform Settings", desc: "Configure system limits", icon: Settings },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-heading text-midnight-ink">Command Center</h1>
        <p className="text-body text-ash mt-1">Operational overview and quick actions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {operationalStats.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-5 flex items-center gap-4 hover:border-signal-blue/30 transition-all">
            <div className={`p-3 rounded-cards ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-caption text-ash uppercase tracking-wide">{stat.label}</p>
              <p className="text-heading text-graphite">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden">
            <div className="p-5 border-b border-slate-custom/10 bg-linen-canvas flex items-center justify-between">
              <h2 className="text-heading-sm text-graphite flex items-center gap-2">
                <Activity size={18} className="text-signal-blue" />
                Live Platform Activity
              </h2>
            </div>
            {activityLoading ? (
              <div className="py-12 flex justify-center"><LoadingSpinner /></div>
            ) : !activityData?.items?.length ? (
              <div className="py-12 text-center text-body text-ash">No recent activity detected.</div>
            ) : (
              <div className="divide-y divide-slate-custom/10">
                {activityData.items.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-heading-sm text-graphite px-1">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-center justify-between p-4 bg-white border border-slate-custom/10 rounded-cards shadow-product-card hover:border-signal-blue/30 hover:bg-sky-wash transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-cards bg-linen-canvas border border-slate-custom/10 text-graphite group-hover:bg-white group-hover:text-signal-blue group-hover:border-signal-blue/20 transition-all">
                    <action.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-body font-medium text-graphite">{action.label}</h3>
                    <p className="text-caption text-ash mt-0.5">{action.desc}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-fog group-hover:text-signal-blue transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
