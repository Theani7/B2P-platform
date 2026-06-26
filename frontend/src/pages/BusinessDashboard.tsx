import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

import { useBusinessInvitations } from "../features/collaboration/api";
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
  ResponsiveContainer
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
  const { data: activityData, isLoading: activityLoading } = useBusinessActivity({ size: 5 });
  const { data: profileCompletion, isLoading: completionLoading } = useBusinessProfileCompletion();

  const pendingInvitations = invitations?.items?.filter((i) => i.status === InvitationStatus.PENDING) ?? [];

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
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Applications Trend</h2>
              <p className="text-sm text-gray-500 mt-1">Number of promoter applications over the last 6 months</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {analytics?.charts?.monthly_applications?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.charts.monthly_applications} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
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
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366F1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorApps)" 
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

        {/* Right Column: Profile Completion, Quick Actions & Recent Activity */}
        <div className="space-y-8">
          <ProfileCompletionWidget data={profileCompletion} isLoading={completionLoading} />
          
          {/* Pending Invitations */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">Pending Invitations</h2>
              </div>
              <Link to="/business/invitations" className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
                View all
              </Link>
            </div>
            {pendingInvitations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No pending invitations</p>
                <p className="text-xs text-gray-500 mt-1">Invite promoters to collaborate.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 flex-1">
                {pendingInvitations.map((inv) => (
                  <Link
                    key={inv.id}
                    to="/business/invitations"
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {inv.business_name?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{inv.business_name || "Unknown Business"}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">Campaign: {inv.campaign_title}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 text-xs font-medium text-amber-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Pending
                    </div>
                  </Link>
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
