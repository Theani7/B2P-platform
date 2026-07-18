import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { usePromoterInvitations, usePromoterCollaborations, useAcceptInvitation, useRejectInvitation } from "../features/collaboration/api";
import { usePromoterAnalytics } from "../features/analytics/api";
import { usePromoterProfile, useUploadAvatar, useUpsertPromoterProfile } from "../features/profile";
import { Avatar, StatCard } from "../components/ui";
import { formatNepaliCurrency } from "../utils/currency";
import { useMyActivity } from "../features/activity/api";
import { usePromoterProfileCompletion } from "../features/profile-completion";
import { ActivityCard, ProfileCompletionWidget } from "../components/ui";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Handshake,
  Star,
  Camera,
  Mail,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from "lucide-react";

export default function PromoterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatarMutation = useUploadAvatar();
  const updateProfileMutation = useUpsertPromoterProfile();

  const { data: invitations, isLoading: invsLoading } = usePromoterInvitations({ limit: 5 });
  const { data: collabs, isLoading: collabsLoading } = usePromoterCollaborations({ limit: 5 });
  const { data: analytics } = usePromoterAnalytics();
  const { data: activityData, isLoading: activityLoading } = useMyActivity({ size: 5 });
  const { data: profileCompletion, isLoading: completionLoading } = usePromoterProfileCompletion();
  const { data: profile } = usePromoterProfile();

  const pendingInvites = analytics?.summary?.invitations_pending ?? 0;
  const activeCollabs = analytics?.summary?.active_collaborations ?? 0;

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadAvatarMutation.mutateAsync(file);
      const currentValues = {};
      await updateProfileMutation.mutateAsync({ ...currentValues, avatar_url: url } as any);
    } catch {
      // error handled by mutation
    } finally {
      setAvatarUploading(false);
    }
  };

  const onCameraClick = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarUpload(file);
  };

  const acceptMutation = useAcceptInvitation();
  const rejectMutation = useRejectInvitation();
  const [actionConfirm, setActionConfirm] = useState<{ id: string; action: "accept" | "reject" } | null>(null);

  const confirmAction = () => {
    if (!actionConfirm) return;
    if (actionConfirm.action === "accept") {
      acceptMutation.mutate(actionConfirm.id, {
        onSuccess: () => { setActionConfirm(null); },
        onError: () => { setActionConfirm(null); },
      });
    } else {
      rejectMutation.mutate(actionConfirm.id, {
        onSuccess: () => { setActionConfirm(null); },
        onError: () => { setActionConfirm(null); },
      });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      
      {/* Hero Header */}
      <div className="bg-white border border-slate-custom/10 rounded-xl shadow-sm overflow-hidden border-t-[#7F77DD]">
        <div className="h-24 bg-gradient-to-r from-sky-wash via-periwinkle-glow/30 to-sky-wash relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        </div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-10">
            <div className="flex items-end gap-5">
              <div className="relative group">
                {avatarUploading ? (
                  <div className="w-24 h-24 rounded-full bg-sky-wash border-4 border-white flex items-center justify-center shadow-sm">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <Avatar src={profile?.avatar_url} initials={user?.full_name?.[0]?.toUpperCase() ?? "P"} size="lg" className="w-24 h-24 text-2xl ring-4 ring-white shadow-sm" colorIndex={2} />
                )}
                <button
                  type="button"
                  onClick={onCameraClick}
                  disabled={avatarUploading}
                  className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-custom/10 hover:bg-sky-wash transition-colors text-graphite disabled:opacity-50 shadow-sm opacity-0 group-hover:opacity-100"
                >
                  <Camera size={14} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-graphite tracking-tight">{user?.full_name ?? "Creator"}</h1>
                  {profile?.verified && (
                    <CheckCircle2 size={20} className="text-emerald-status" />
                  )}
                </div>
                <p className="text-sm font-medium text-ash mt-0.5 flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-tag text-amber-tag" /> 
                  <span className="text-graphite font-bold">{analytics?.summary?.average_rating ?? "0.0"}</span> 
                  ({analytics?.summary?.reviews_received ?? 0} reviews)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link to="/promoter/profile" className="flex-1 md:flex-none flex justify-center items-center h-11 px-6 rounded-inputs bg-white border border-slate-custom/10 text-sm font-bold text-graphite hover:bg-sky-wash transition-colors shadow-sm">
                Edit Profile
              </Link>
              <Link to="/promoter/marketplace" className="flex-1 md:flex-none flex justify-center items-center h-11 px-6 rounded-inputs bg-signal-blue text-white text-sm font-bold hover:bg-signal-blue/90 transition-colors shadow-sm">
                Browse Campaigns
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatCard label="Pending Invites" value={pendingInvites} icon={Mail} />
        <StatCard label="Active Collabs" value={activeCollabs} icon={Handshake} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Collaborations */}
          <div className="bg-white border border-slate-custom/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-custom/10 bg-linen-canvas/50">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-signal-blue/10 rounded-md">
                  <Handshake size={18} className="text-signal-blue" />
                </div>
                <h2 className="text-base font-bold text-graphite">Active Collaborations</h2>
              </div>
              <Link to="/promoter/collaborations" className="text-xs font-bold text-signal-blue hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="p-6">
              {collabsLoading ? (
                <div className="h-32 bg-sky-wash/50 rounded-lg animate-pulse"></div>
              ) : !collabs || collabs.items.length === 0 ? (
                <div className="bg-sky-wash/30 border border-slate-custom/10 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center text-signal-blue mb-3">
                    <Handshake size={20} />
                  </div>
                  <p className="text-sm font-bold text-graphite mb-1">No active collaborations</p>
                  <p className="text-xs text-ash max-w-xs mx-auto">Apply to campaigns to start working with brands and earning.</p>
                  <Link to="/promoter/marketplace" className="mt-4 px-4 h-9 flex items-center justify-center rounded-inputs bg-white border border-slate-custom/10 text-xs font-bold text-graphite shadow-sm hover:bg-sky-wash transition-colors">
                    Find Campaigns
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {collabs.items.slice(0, 3).map((c: any) => (
                    <div key={c.id} className="bg-white border border-slate-custom/10 rounded-xl p-4 shadow-sm flex items-center justify-between group hover:border-signal-blue/30 transition-all cursor-pointer" onClick={() => navigate('/promoter/collaborations')}>
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-periwinkle-glow/30 text-signal-blue rounded-lg flex flex-shrink-0 items-center justify-center text-lg font-bold">
                          {c.campaign_title?.[0] || 'C'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-graphite truncate">{c.campaign_title}</p>
                          <p className="text-[11px] font-medium text-ash uppercase tracking-wider mt-1">{c.business_name} • Deadline: 12 Aug</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-status bg-emerald-status/10 px-2 py-1 rounded">In Progress</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-custom/20 group-hover:text-signal-blue transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sub-grid: Recent Activity & Pending Invites Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Recent Activity */}
            <div className="bg-white border border-slate-custom/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-custom/10 bg-linen-canvas/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-custom/5 rounded-md">
                    <BarChart3 size={18} className="text-graphite" />
                  </div>
                  <h2 className="text-base font-bold text-graphite">Recent Activity</h2>
                </div>
              </div>
              {activityLoading ? (
                <div className="p-8 flex justify-center"><LoadingSpinner /></div>
              ) : !activityData?.items?.length ? (
                <div className="p-12 text-center border-t border-slate-custom/5 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-sky-wash flex items-center justify-center mx-auto mb-4">
                    <BarChart3 size={24} className="text-signal-blue" />
                  </div>
                  <p className="text-base font-bold text-graphite mb-1">No recent activity</p>
                  <p className="text-sm text-ash">Your notifications and actions will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-custom/5">
                  {activityData.items.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>

            {/* Pending Invitations Widget */}
            <div className="bg-white border border-slate-custom/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-custom/10 bg-linen-canvas/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-tag/10 rounded-md">
                    <Mail size={18} className="text-amber-tag" />
                  </div>
                  <h2 className="text-base font-bold text-graphite">Pending Invites</h2>
                  {pendingInvites > 0 && <span className="bg-amber-tag text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ml-1">{pendingInvites}</span>}
                </div>
              </div>

              <div className="p-6 flex flex-col">
                {invsLoading ? (
                  <div className="space-y-3"><div className="h-16 bg-sky-wash/50 rounded-lg animate-pulse"></div></div>
                ) : !invitations || invitations.items.filter((i: any) => i.status === 'PENDING').length === 0 ? (
                  <div className="text-center py-8 bg-sky-wash/30 rounded-xl border border-dashed border-slate-custom/10 flex flex-col items-center justify-center">
                    <p className="text-sm font-bold text-graphite">You're all caught up!</p>
                    <p className="text-xs text-ash mt-1">No pending invitations.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.items.filter((i: any) => i.status === 'PENDING').slice(0, 3).map((inv: any) => (
                      <div key={inv.id} className="border border-slate-custom/10 rounded-xl p-4 hover:border-signal-blue/30 transition-colors shadow-sm">
                        <p className="text-sm font-bold text-graphite truncate">{inv.campaign_title}</p>
                        <p className="text-[11px] font-bold text-ash uppercase tracking-wider mt-1 mb-4">{formatNepaliCurrency(inv.campaign_budget)}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActionConfirm({ id: inv.id, action: "accept" })}
                            disabled={acceptMutation.isPending}
                            className="flex-1 h-9 bg-signal-blue text-white rounded-inputs text-xs font-bold hover:bg-signal-blue/90 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => setActionConfirm({ id: inv.id, action: "reject" })}
                            disabled={rejectMutation.isPending}
                            className="flex-1 h-9 bg-white border border-coral-alert/20 text-coral-alert rounded-inputs text-xs font-bold hover:bg-coral-alert/10 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                    <Link to="/promoter/invitations" className="block w-full text-center text-xs font-bold text-signal-blue hover:underline pt-3">
                      View all invitations
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileCompletionWidget data={profileCompletion} isLoading={completionLoading} />
        </div>

      </div>

      {/* Confirmation Modal */}
      {actionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-ink/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-custom/10 rounded-2xl p-8 shadow-xl max-w-sm w-full relative">
            <h3 className="text-xl font-bold text-graphite mb-3">
              {actionConfirm.action === 'accept' ? 'Accept Invitation' : 'Decline Invitation'}
            </h3>
            <p className="text-sm font-medium text-ash leading-relaxed mb-8">
              {actionConfirm.action === 'accept'
                ? 'Are you sure you want to accept this invitation? This will instantly start a new collaboration project and notify the brand.'
                : 'Are you sure you want to decline? The business will be notified.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setActionConfirm(null)} className="px-5 py-2.5 text-sm font-bold text-graphite bg-white border border-slate-custom/10 rounded-inputs hover:bg-sky-wash transition-colors shadow-sm">
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className={`px-6 py-2.5 text-sm font-bold text-white rounded-inputs transition-colors disabled:opacity-50 shadow-sm ${actionConfirm.action === 'accept' ? 'bg-signal-blue hover:bg-signal-blue/90' : 'bg-coral-alert hover:bg-coral-alert/90'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
