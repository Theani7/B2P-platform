import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useBusinessInvitations, useBusinessApplications } from "../features/collaboration/api";
import { InvitationStatus } from "../features/collaboration/types";
import { StatCard } from "../components/ui";
import {
  Plus,
  Search,
  Mail,
  FolderOpen,
  CheckCircle2,
  FolderDot,
  Activity as ActivityIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useBusinessAnalytics } from "../features/analytics";
import { useBusinessActivity } from "../features/activity";
import { useBusinessProfileCompletion } from "../features/profile-completion";
import LoadingSpinner from "../components/LoadingSpinner";
import { ActivityCard, ProfileCompletionWidget } from "../components/ui";

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { data: analytics, isLoading: statsLoading } = useBusinessAnalytics();
  const { data: invitations } = useBusinessInvitations({ limit: 5 });
  const { data: applicationsData, isLoading: recentApplicationsLoading } = useBusinessApplications({ limit: 5 });
  const { data: activityData, isLoading: activityLoading } = useBusinessActivity({ size: 5 });
  const { data: profileCompletion, isLoading: completionLoading } = useBusinessProfileCompletion();

  const pendingInvitations = invitations?.items?.filter((i) => i.status === InvitationStatus.PENDING) ?? [];
  const recentApplications = applicationsData?.items ?? [];

  const COLORS = ["#145aff", "#16ca2e", "#ffa64d", "#f26052", "#374151"];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-midnight-ink">Overview</h1>
          <p className="text-body text-ash mt-2">
            Welcome back, {user?.full_name?.split(" ")[0] || "there"}. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/business/promoters"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-custom/20 text-slate-custom rounded-button text-sm font-medium hover:bg-sky-wash transition-colors"
          >
            <Search size={16} />
            Find promoters
          </Link>
          <Link
            to="/business/campaigns/create"
            className="inline-flex items-center gap-2 px-4 py-2 hero-blue-fade text-white rounded-button text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Create campaign
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Campaigns"
          value={statsLoading ? "—" : analytics?.summary.total_campaigns ?? 0}
          icon={FolderDot}
          trend={{ value: `${analytics?.growth.campaign_growth ?? 0}%`, positive: (analytics?.growth.campaign_growth ?? 0) >= 0 }}
          subtitle="from last month"
        />
        <StatCard
          label="Active Campaigns"
          value={statsLoading ? "—" : analytics?.summary.active_campaigns ?? 0}
          icon={FolderOpen}
          trend={undefined}
          subtitle="currently open"
        />
        <StatCard
          label="Active Collaborations"
          value={statsLoading ? "—" : analytics?.summary.active_collaborations ?? 0}
          icon={ActivityIcon}
          trend={{ value: `${analytics?.growth.collaboration_growth ?? 0}%`, positive: (analytics?.growth.collaboration_growth ?? 0) >= 0 }}
          subtitle="from last month"
        />
        <StatCard
          label="Total Applications"
          value={statsLoading ? "—" : analytics?.summary.total_applications ?? 0}
          icon={CheckCircle2}
          trend={{ value: `${analytics?.growth.application_growth ?? 0}%`, positive: (analytics?.growth.application_growth ?? 0) >= 0 }}
          subtitle="from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-custom/10 rounded-cards p-5 shadow-product-card">
            <h2 className="text-heading text-graphite mb-1">Platform Activity Trend</h2>
            <p className="text-sm text-ash mb-6">Applications and Collaborations over the last 6 months</p>
            <div className="h-[300px] w-full">
              {analytics?.charts?.monthly_applications?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#145aff" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#145aff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCollabs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16ca2e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#16ca2e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" allowDuplicatedCategory={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151' }} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4fe" />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #f0f4fe', boxShadow: 'rgba(0,0,0,0.1) 0px 0px 4px -2px' }}
                      itemStyle={{ color: '#14141e', fontWeight: 500 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" data={analytics.charts.monthly_applications} dataKey="value" name="Applications" stroke="#145aff" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                    <Area type="monotone" data={analytics.charts.monthly_collaborations} dataKey="value" name="Collaborations" stroke="#16ca2e" strokeWidth={2} fillOpacity={1} fill="url(#colorCollabs)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-ash text-sm">
                  {statsLoading ? <LoadingSpinner className="w-8 h-8" /> : "No analytics available yet."}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-custom/10 rounded-cards p-5 shadow-product-card">
              <h2 className="text-heading-sm text-graphite mb-1">Application Status</h2>
              <p className="text-sm text-ash mb-6">Distribution of your campaign applications</p>
              <div className="h-[220px] w-full">
                {analytics?.charts?.application_status_distribution?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.charts.application_status_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {analytics.charts.application_status_distribution.map((entry, index) => {
                          return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                        })}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #f0f4fe', boxShadow: 'rgba(0,0,0,0.1) 0px 0px 4px -2px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-fog text-sm">No data</div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-custom/10 rounded-cards p-5 shadow-product-card">
              <h2 className="text-heading-sm text-graphite mb-1">Top Campaigns</h2>
              <p className="text-sm text-ash mb-6">By number of applications received</p>
              <div className="h-[220px] w-full">
                {analytics?.charts?.top_campaigns_by_applications?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.charts.top_campaigns_by_applications} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f4fe" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 11, fill: '#374151' }} />
                      <Tooltip cursor={{ fill: '#fcfcfc' }} />
                      <Bar dataKey="value" name="Applications" fill="#145aff" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-fog text-sm">No data</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ProfileCompletionWidget data={profileCompletion} isLoading={completionLoading} />

          <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-custom/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-ash" />
                <h2 className="text-sm font-medium text-graphite">Recent Applications</h2>
              </div>
            </div>
            {recentApplicationsLoading ? (
              <div className="p-6 flex justify-center"><LoadingSpinner /></div>
            ) : !recentApplications?.length ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-sky-wash flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} className="text-signal-blue" />
                </div>
                <p className="text-sm font-medium text-graphite">No recent applications</p>
                <p className="text-xs text-ash mt-1">When promoters apply, they'll appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-custom/10 flex-1 overflow-y-auto">
                {recentApplications.map((app: any) => (
                  <div key={app.id} className="p-4 hover:bg-sky-wash/50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-custom/10 flex items-center justify-center flex-shrink-0">
                        {app.promoter_avatar_url ? (
                          <img src={app.promoter_avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-xs font-bold text-graphite">{app.promoter_username?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-graphite">{app.promoter_username}</h4>
                        <p className="text-xs text-ash mt-0.5">Applied for <span className="font-medium text-graphite">{app.campaign_title}</span></p>
                      </div>
                    </div>
                    <Link
                      to={`/business/campaigns/${app.campaign_id}/applications`}
                      className="text-xs font-medium text-signal-blue hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-custom/10">
              <div className="flex items-center gap-2">
                <ActivityIcon size={16} className="text-ash" />
                <h2 className="text-sm font-medium text-graphite">Recent Activity</h2>
              </div>
            </div>
            {activityLoading ? (
              <div className="p-8 flex justify-center"><LoadingSpinner /></div>
            ) : !activityData?.items?.length ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-sky-wash flex items-center justify-center mx-auto mb-3">
                  <ActivityIcon size={20} className="text-signal-blue" />
                </div>
                <p className="text-sm font-medium text-graphite">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-custom/10 flex-1">
                {activityData.items.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
