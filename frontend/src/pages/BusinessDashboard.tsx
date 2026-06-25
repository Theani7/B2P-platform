import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useCampaignDashboardStats } from "../features/campaigns/api";
import { useBusinessCollaborations, useBusinessInvitations } from "../features/collaboration/api";
import { CollaborationStatus, InvitationStatus } from "../features/collaboration/types";
import { StatCard } from "../components/ui";
import {
  Plus,
  Search,
  Zap,
  ArrowRight,
  Mail,
  ChevronRight,
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

const chartData = [
  { name: "Jan", applications: 12 },
  { name: "Feb", applications: 19 },
  { name: "Mar", applications: 15 },
  { name: "Apr", applications: 28 },
  { name: "May", applications: 22 },
  { name: "Jun", applications: 45 },
];

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useCampaignDashboardStats();
  const { data: collabs } = useBusinessCollaborations({ limit: 5 });
  const { data: invitations } = useBusinessInvitations({ limit: 5 });

  const pendingInvitations = invitations?.items?.filter((i) => i.status === InvitationStatus.PENDING) ?? [];
  const activeCollabs = collabs?.items?.filter((c) => c.status === CollaborationStatus.ACTIVE) ?? [];

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
          value={statsLoading ? "—" : stats?.total_campaigns ?? 0}
          icon={FolderDot}
          trend={{ value: "+12%", positive: true }}
          subtitle="from last month"
        />
        <StatCard
          label="Open Campaigns"
          value={statsLoading ? "—" : stats?.open_campaigns ?? 0}
          icon={FolderOpen}
          trend={{ value: "+4%", positive: true }}
          subtitle="from last month"
        />
        <StatCard
          label="Active Collaborations"
          value={statsLoading ? "—" : stats?.active_campaigns ?? 0}
          icon={Zap}
          trend={{ value: "-2%", positive: false }}
          subtitle="from last month"
        />
        <StatCard
          label="Completed Campaigns"
          value={statsLoading ? "—" : stats?.completed_campaigns ?? 0}
          icon={CheckCircle2}
          trend={{ value: "+24%", positive: true }}
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
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
                  dataKey="applications" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorApps)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-8">
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
                      <p className="text-sm font-medium text-gray-900 truncate">{inv.campaign_title}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">Awaiting response</p>
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

          {/* Active Collaborations */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">Active Collabs</h2>
              </div>
            </div>
            {activeCollabs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Zap size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No active collabs</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 flex-1">
                {activeCollabs.map((c) => (
                  <Link
                    key={c.id}
                    to="/business/collaborations"
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {c.partner_name?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.partner_name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{c.campaign_title}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
