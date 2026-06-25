import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useCampaignDashboardStats } from "../features/campaigns/api";
import { useBusinessCollaborations, useBusinessInvitations } from "../features/collaboration/api";
import StatusBadge from "../components/StatusBadge";
import { CampaignStatus } from "../features/campaigns/types";
import { CollaborationStatus, InvitationStatus } from "../features/collaboration/types";
import {
  Plus,
  Search,
  FolderOpen,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Users,
  Mail,
} from "lucide-react";

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useCampaignDashboardStats();
  const { data: collabs } = useBusinessCollaborations({ limit: 5 });
  const { data: invitations } = useBusinessInvitations({ limit: 5 });

  const pendingInvitations = invitations?.items?.filter((i) => i.status === InvitationStatus.PENDING) ?? [];
  const activeCollabs = collabs?.items?.filter((c) => c.status === CollaborationStatus.ACTIVE) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">
            Welcome back, {user?.full_name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your campaigns</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/business/promoters"
            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Search size={16} />
            Find promoters
          </Link>
          <Link
            to="/business/campaigns/create"
            className="bg-brand-indigo text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: "#5B4FCF" }}
          >
            <Plus size={16} />
            Create campaign
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total campaigns"
          value={stats?.total_campaigns ?? 0}
          icon={<FolderOpen size={20} />}
          iconBg="bg-brand-purple-50"
          iconColor="text-brand-purple"
          loading={statsLoading}
        />
        <StatCard
          label="Open"
          value={stats?.open_campaigns ?? 0}
          icon={<Zap size={20} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          loading={statsLoading}
        />
        <StatCard
          label="Active"
          value={stats?.active_campaigns ?? 0}
          icon={<Clock size={20} />}
          iconBg="bg-brand-teal-50"
          iconColor="text-brand-teal"
          loading={statsLoading}
        />
        <StatCard
          label="Completed"
          value={stats?.completed_campaigns ?? 0}
          icon={<CheckCircle2 size={20} />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          loading={statsLoading}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent campaigns — 2 cols */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Recent campaigns</h2>
            <Link to="/business/campaigns" className="text-xs text-brand-purple hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {statsLoading ? (
            <div className="p-8 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent mx-auto" />
            </div>
          ) : !stats?.recent_campaigns?.length ? (
            <div className="p-10 text-center">
              <FolderOpen size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-3">No campaigns yet</p>
              <Link
                to="/business/campaigns/create"
                className="inline-flex items-center gap-2 bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
                style={{ backgroundColor: "#5B4FCF" }}
              >
                <Plus size={14} />
                Create your first campaign
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.recent_campaigns.map((c) => (
                <Link
                  key={c.id}
                  to={`/business/campaigns/${c.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      NPR {c.budget.toLocaleString()} · {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <StatusBadge status={c.status as CampaignStatus} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Active collaborations */}
          <div className="bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-900">Active collaborations</h2>
              <Link to="/business/collaborations" className="text-xs text-brand-purple hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {activeCollabs.length === 0 ? (
              <div className="p-6 text-center">
                <Users size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No active collaborations</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeCollabs.map((c) => (
                  <Link
                    key={c.id}
                    to="/business/collaborations"
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-purple-50 text-brand-purple-900 flex items-center justify-center text-[11px] font-medium flex-shrink-0">
                      {c.partner_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.partner_name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{c.campaign_title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pending invitations */}
          <div className="bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-900">Pending invites</h2>
              <Link to="/business/invitations" className="text-xs text-brand-purple hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {pendingInvitations.length === 0 ? (
              <div className="p-6 text-center">
                <Mail size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No pending invitations</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingInvitations.map((inv) => (
                  <Link
                    key={inv.id}
                    to="/business/invitations"
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-amber-50 text-brand-amber-900 flex items-center justify-center text-[11px] font-medium flex-shrink-0">
                      {inv.promoter_profile_id?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">Promoter</p>
                      <p className="text-[11px] text-gray-400 truncate">{inv.campaign_title}</p>
                    </div>
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

function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-medium text-gray-900">{loading ? "—" : value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
