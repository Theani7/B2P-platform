import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

import { useBusinessInvitations, useBusinessApplications } from "../features/collaboration/api";
import { InvitationStatus } from "../features/collaboration/types";
import { StatCard } from "../components/ui";
import {
  Plus,
  Search,
  Zap,
  Mail,
  FolderOpen,
  CheckCircle2,
  FolderDot
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
  Legend
} from "recharts";
import { useBusinessAnalytics } from "../features/analytics";
import { useBusinessActivity } from "../features/activity";
import { useBusinessProfileCompletion } from "../features/profile-completion";
import LoadingSpinner from "../components/LoadingSpinner";
import { ActivityCard, ProfileCompletionWidget } from "../components/ui";
import { Activity } from "lucide-react";

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { data: analytics, isLoading: statsLoading } = useBusinessAnalytics();
  const { data: invitations } = useBusinessInvitations({ limit: 5 });
  const { data: applicationsData, isLoading: recentApplicationsLoading } = useBusinessApplications({ limit: 5 });
  const { data: activityData, isLoading: activityLoading } = useBusinessActivity({ size: 5 });
  const { data: profileCompletion, isLoading: completionLoading } = useBusinessProfileCompletion();

  const pendingInvitations = invitations?.items?.filter((i) => i.status === InvitationStatus.PENDING) ?? [];
  const recentApplications = applicationsData?.items ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Overview
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Welcome back, {user?.full_name?.split(" ")[0] || "there"}. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/business/promoters"
            className="bg-white shadow-sm ring-1 ring-gray-200 text-gray-700 rounded-lg h-10 px-4 text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2"
          >
            <Search size={16} />
            Find promoters
          </Link>
          <Link
            to="/business/campaigns/create"
            className="bg-primary-600 shadow-sm text-white rounded-lg h-10 px-4 text-sm font-medium hover:bg-primary-700 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Create campaign
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          icon={Zap}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Trend Chart */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Platform Activity Trend</h2>
                <p className="text-sm text-gray-500 mt-1">Applications and Collaborations over the last 6 months</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {analytics?.charts?.monthly_applications?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7F77DD" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCollabs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      allowDuplicatedCategory={false}
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6B7280' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6B7280' }} 
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#111827', fontWeight: 500 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area 
                      type="monotone" 
                      data={analytics.charts.monthly_applications}
                      dataKey="value" 
                      name="Applications"
                      stroke="#7F77DD" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorApps)" 
                    />
                    <Area 
                      type="monotone" 
                      data={analytics.charts.monthly_collaborations}
                      dataKey="value" 
                      name="Collaborations"
                      stroke="#1D9E75" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCollabs)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                  {statsLoading ? <LoadingSpinner className="w-8 h-8" /> : "No analytics available yet."}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pie Chart: Application Status */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Application Status</h2>
              <p className="text-sm text-gray-500 mb-6">Distribution of your campaign applications</p>
              <div className="h-[220px] w-full">
                {analytics?.charts?.application_status_distribution?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.charts.application_status_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.charts.application_status_distribution.map((entry, index) => {
                          const COLORS = ['#7F77DD', '#1D9E75', '#F59E0B', '#EF4444', '#6B7280'];
                          return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#111827', fontWeight: 500 }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
                )}
              </div>
            </div>

            {/* Bar Chart: Top Campaigns */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Top Campaigns</h2>
              <p className="text-sm text-gray-500 mb-6">By number of applications received</p>
              <div className="h-[220px] w-full">
                {analytics?.charts?.top_campaigns_by_applications?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.charts.top_campaigns_by_applications}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        width={100}
                        tick={{ fontSize: 11, fill: '#4B5563' }} 
                      />
                      <Tooltip 
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" name="Applications" fill="#5B4FCF" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Completion, Quick Actions & Recent Activity */}
        <div className="space-y-8">
          <ProfileCompletionWidget data={profileCompletion} isLoading={completionLoading} />
          
          {/* Recent Applications */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">Recent Applications</h2>
              </div>
            </div>
            {recentApplicationsLoading ? (
              <div className="p-6 flex justify-center"><LoadingSpinner /></div>
            ) : !recentApplications?.length ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No recent applications</p>
                <p className="text-xs text-gray-500 mt-1">When promoters apply, they'll appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
                {recentApplications.map((app: any) => (
                  <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                        {app.promoter_avatar_url ? (
                          <img src={app.promoter_avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-xs font-bold text-gray-500">{app.promoter_username?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{app.promoter_username}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Applied for <span className="font-medium text-gray-700">{app.campaign_title}</span></p>
                      </div>
                    </div>
                    <Link
                      to={`/business/campaigns/${app.campaign_id}/applications`}
                      className="text-xs font-semibold text-brand-purple hover:text-brand-indigo"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Stream */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
              </div>
            </div>
            {activityLoading ? (
              <div className="p-8 flex justify-center"><LoadingSpinner /></div>
            ) : !activityData?.items?.length ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Activity size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 flex-1">
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
