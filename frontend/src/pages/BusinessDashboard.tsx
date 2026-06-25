import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useCampaignDashboardStats } from "../features/campaigns/api";
import { useBusinessCollaborations, useBusinessInvitations } from "../features/collaboration/api";
import { CollaborationStatus, InvitationStatus } from "../features/collaboration/types";
import {
  Plus,
  Search,
  FolderOpen,
  Zap,
  CheckCircle2,
  ArrowRight,
  Users,
  Mail,
  TrendingUp,
  BarChart3,
  Target,
  Rocket,
  Activity,
  ChevronRight,
} from "lucide-react";

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useCampaignDashboardStats();
  const { data: collabs } = useBusinessCollaborations({ limit: 5 });
  const { data: invitations } = useBusinessInvitations({ limit: 5 });

  const pendingInvitations = invitations?.items?.filter((i) => i.status === InvitationStatus.PENDING) ?? [];
  const activeCollabs = collabs?.items?.filter((c) => c.status === CollaborationStatus.ACTIVE) ?? [];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-purple via-brand-indigo to-brand-purple-900 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                <Rocket size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-white">
                  Welcome back, {user?.full_name?.split(" ")[0] || "there"}
                </h1>
                <p className="text-sm text-white/70 mt-0.5">Here's what's happening with your business today</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/business/promoters"
              className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
            >
              <Search size={16} />
              Find promoters
            </Link>
            <Link
              to="/business/campaigns/create"
              className="group bg-white text-brand-purple rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <Plus size={16} />
              Create campaign
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total campaigns"
          value={stats?.total_campaigns ?? 0}
          icon={<FolderOpen size={20} />}
          variant="purple"
          loading={statsLoading}
        />
        <StatCard
          label="Open"
          value={stats?.open_campaigns ?? 0}
          icon={<Target size={20} />}
          variant="indigo"
          loading={statsLoading}
          trend="+12%"
        />
        <StatCard
          label="Active"
          value={stats?.active_campaigns ?? 0}
          icon={<Activity size={20} />}
          variant="teal"
          loading={statsLoading}
        />
        <StatCard
          label="Completed"
          value={stats?.completed_campaigns ?? 0}
          icon={<CheckCircle2 size={20} />}
          variant="success"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          to="/business/campaigns"
          icon={BarChart3}
          label="Manage Campaigns"
          desc="View, edit and track all your campaigns"
          color="purple"
        />
        <QuickActionCard
          to="/business/promoters"
          icon={Users}
          label="Discover Promoters"
          desc="Find and connect with top promoters"
          color="teal"
        />
        <QuickActionCard
          to="/business/collaborations"
          icon={Rocket}
          label="Active Collaborations"
          desc="Manage ongoing partnerships"
          color="amber"
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Collaborations */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden group hover:border-gray-200 transition-colors duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-brand-teal-50/50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-teal-50 flex items-center justify-center">
                <Zap size={18} className="text-brand-teal" />
              </div>
              <h2 className="text-sm font-medium text-gray-900">Active Collaborations</h2>
            </div>
            <Link to="/business/collaborations" className="group/link text-[11px] text-brand-teal uppercase tracking-wider hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {activeCollabs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-teal-50 to-brand-teal-50/50 flex items-center justify-center mx-auto mb-3 ring-1 ring-brand-teal/10">
                <Zap size={24} className="text-brand-teal" />
              </div>
              <p className="text-sm font-medium text-gray-900">No active collaborations</p>
              <p className="text-xs text-gray-500 mt-1">Accept applications or send invites to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activeCollabs.map((c) => (
                <Link
                  key={c.id}
                  to="/business/collaborations"
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/80 transition-colors group/item"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple-50 to-brand-indigo-50 text-brand-purple-900 flex items-center justify-center text-sm font-medium flex-shrink-0 ring-1 ring-brand-purple/5">
                    {c.partner_name?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover/item:text-brand-purple transition-colors">{c.partner_name}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{c.campaign_title}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover/item:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invitations */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden group hover:border-gray-200 transition-colors duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-brand-amber-50/50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-amber-50 flex items-center justify-center">
                <Mail size={18} className="text-brand-amber" />
              </div>
              <h2 className="text-sm font-medium text-gray-900">Pending Invitations</h2>
            </div>
            <Link to="/business/invitations" className="group/link text-[11px] text-brand-amber uppercase tracking-wider hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {pendingInvitations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-amber-50 to-brand-amber-50/50 flex items-center justify-center mx-auto mb-3 ring-1 ring-brand-amber/10">
                <Mail size={24} className="text-brand-amber" />
              </div>
              <p className="text-sm font-medium text-gray-900">No pending invitations</p>
              <p className="text-xs text-gray-500 mt-1">Invite promoters from their profiles to collaborate</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingInvitations.map((inv) => (
                <Link
                  key={inv.id}
                  to="/business/invitations"
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/80 transition-colors group/item"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-amber-50 to-brand-amber-50/80 text-brand-amber-900 flex items-center justify-center text-sm font-medium flex-shrink-0 ring-1 ring-brand-amber/10">
                    {inv.business_name?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover/item:text-brand-amber transition-colors">{inv.campaign_title}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">Invitation sent</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-brand-amber-50 text-brand-amber-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-amber animate-pulse" />
                    Pending
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  variant = "purple",
  loading,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: "purple" | "indigo" | "teal" | "success";
  loading: boolean;
  trend?: string;
}) {
  const variantClass =
    variant === "purple"
      ? "bg-gradient-to-br from-brand-purple-50 to-brand-purple-50/50 text-brand-purple ring-brand-purple/10"
      : variant === "indigo"
      ? "bg-gradient-to-br from-brand-indigo-50 to-brand-indigo-50/50 text-brand-indigo ring-brand-indigo/10"
      : variant === "teal"
      ? "bg-gradient-to-br from-brand-teal-50 to-brand-teal-50/50 text-brand-teal ring-brand-teal/10"
      : "bg-gradient-to-br from-green-50 to-emerald-50/50 text-green-600 ring-green-500/10";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${variantClass} flex items-center justify-center ring-1`}>
          {icon}
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-teal bg-brand-teal-50 px-2 py-1 rounded-full">
            <TrendingUp size={12} />
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-semibold text-gray-900 tabular-nums">{loading ? "—" : value}</p>
      <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-1.5 font-medium">{label}</p>
    </div>
  );
}

function QuickActionCard({
  to,
  icon: Icon,
  label,
  desc,
  color,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  color: "purple" | "teal" | "amber";
}) {
  return (
    <Link
      to={to}
      className="group bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color === "purple" ? "from-brand-purple-50 to-brand-indigo-50 text-brand-purple ring-brand-purple/10" : color === "teal" ? "from-brand-teal-50 to-brand-teal-50/50 text-brand-teal ring-brand-teal/10" : "from-brand-amber-50 to-brand-amber-50/50 text-brand-amber ring-brand-amber/10"} flex items-center justify-center ring-1 flex-shrink-0`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 group-hover:text-brand-purple transition-colors">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
