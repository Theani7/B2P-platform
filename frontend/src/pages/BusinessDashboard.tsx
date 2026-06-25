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
      {/* Header section */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-medium text-gray-900">
            Welcome back, {user?.full_name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">Here's an overview of your campaigns and partnerships.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/business/promoters"
            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Search size={16} />
            Find promoters
          </Link>
          <Link
            to="/business/campaigns/create"
            className="bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={16} />
            Create campaign
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total campaigns"
          value={statsLoading ? "—" : stats?.total_campaigns ?? 0}
        />
        <StatCard
          label="Open campaigns"
          value={statsLoading ? "—" : stats?.open_campaigns ?? 0}
        />
        <StatCard
          label="Active campaigns"
          value={statsLoading ? "—" : stats?.active_campaigns ?? 0}
        />
        <StatCard
          label="Completed campaigns"
          value={statsLoading ? "—" : stats?.completed_campaigns ?? 0}
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Collaborations */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-brand-purple" />
              <h2 className="text-sm font-medium text-gray-900">Active Collaborations</h2>
            </div>
            <Link to="/business/collaborations" className="text-xs text-brand-purple hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {activeCollabs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-700">No active collaborations</p>
              <p className="text-xs text-gray-500 mt-1">Accept applications or invite promoters to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeCollabs.map((c) => (
                <Link
                  key={c.id}
                  to="/business/collaborations"
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-purple-50 text-brand-purple-900 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {c.partner_name?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.partner_name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{c.campaign_title}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invitations */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-brand-purple" />
              <h2 className="text-sm font-medium text-gray-900">Pending Invitations</h2>
            </div>
            <Link to="/business/invitations" className="text-xs text-brand-purple hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {pendingInvitations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-700">No pending invitations</p>
              <p className="text-xs text-gray-500 mt-1">Invite promoters from their profiles to collaborate.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingInvitations.map((inv) => (
                <Link
                  key={inv.id}
                  to="/business/invitations"
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-amber-50 text-brand-amber-900 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {inv.business_name?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{inv.campaign_title}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">Awaiting response</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-brand-amber-50 text-brand-amber-900">
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
