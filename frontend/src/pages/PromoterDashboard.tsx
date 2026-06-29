import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
  Briefcase,
  Handshake,
  Star,
  Upload,
  User,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Camera,
  Mail,
  Sparkles,
  Store,
} from "lucide-react";

export default function PromoterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-signal-blue to-signal-blue/80"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-10">
            <div className="flex items-end gap-5">
              <div className="relative">
                {avatarUploading ? (
                  <div className="w-24 h-24 rounded-full bg-sky-wash border-2 border-dashed border-slate-custom/20 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <Avatar src={profile?.avatar_url} initials={user?.full_name?.[0]?.toUpperCase() ?? "P"} size="lg" className="w-24 h-24 text-2xl ring-4 ring-white" colorIndex={2} />
                )}
                <button
                  type="button"
                  onClick={onCameraClick}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-custom/20 hover:bg-sky-wash transition-colors text-ash disabled:opacity-50"
                >
                  <Camera size={14} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-heading-lg text-midnight-ink">{user?.full_name ?? "Creator"}</h1>
                  {profile?.verified && (
                    <CheckCircle2 size={20} className="text-emerald-status" />
                  )}
                </div>
                <p className="text-body text-ash mt-0.5">
                  ⭐ {analytics?.summary?.average_rating ?? "0.0"} ({analytics?.summary?.reviews_received ?? 0} reviews)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link to="/promoter/profile" className="flex-1 md:flex-none flex justify-center items-center h-11 px-6 rounded-button bg-white border border-slate-custom/20 text-sm font-medium text-slate-custom hover:bg-sky-wash transition-colors">
                Complete Profile
              </Link>
              <Link to="/promoter/marketplace" className="flex-1 md:flex-none flex justify-center items-center h-11 px-6 rounded-button hero-blue-fade text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Browse Campaigns
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <StatCard label="Pending Invites" value={pendingInvites} icon={Mail} />
        <StatCard label="Active Collabs" value={activeCollabs} icon={Handshake} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-custom/10">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-ash" />
                <h2 className="text-sm font-medium text-graphite">Recent Activity</h2>
              </div>
            </div>
            {activityLoading ? (
              <div className="p-8 flex justify-center"><LoadingSpinner /></div>
            ) : !activityData?.items?.length ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-sky-wash flex items-center justify-center mx-auto mb-3">
                  <BarChart3 size={20} className="text-signal-blue" />
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

          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-caption font-bold text-ash uppercase tracking-widest">Active Collaborations</h2>
              <Link to="/promoter/collaborations" className="text-xs font-medium text-signal-blue hover:underline">View all</Link>
            </div>

            {collabsLoading ? (
              <div className="h-32 bg-sky-wash/50 rounded-cards animate-pulse"></div>
            ) : !collabs || collabs.items.length === 0 ? (
              <div className="bg-linen-canvas border border-slate-custom/10 border-dashed rounded-cards p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-sky-wash rounded-full flex items-center justify-center text-signal-blue mb-3"><Handshake size={20} /></div>
                <p className="text-sm font-medium text-graphite">No active collaborations</p>
                <p className="text-xs text-ash mt-1 max-w-xs mx-auto">Apply to campaigns to start working with brands.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {collabs.items.slice(0, 3).map((c: any) => (
                  <div key={c.id} className="bg-white border border-slate-custom/10 rounded-cards p-4 shadow-product-card flex items-center justify-between group hover:border-signal-blue/30 transition-all cursor-pointer" onClick={() => navigate('/promoter/collaborations')}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-sky-wash text-signal-blue rounded-button flex flex-shrink-0 items-center justify-center font-bold">{c.campaign_title?.[0] || 'C'}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-graphite truncate">{c.campaign_title}</p>
                        <p className="text-xs text-ash mt-0.5">{c.business_name} • Deadline: 12 Aug</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase text-emerald-status bg-emerald-status/10 px-2 py-0.5 rounded-badges">In Progress</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-custom/40 group-hover:text-signal-blue" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <ProfileCompletionWidget data={profileCompletion} isLoading={completionLoading} />

          <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium text-graphite flex items-center gap-2">
                <Mail size={16} className="text-amber-tag" /> Pending Invitations
                {pendingInvites > 0 && <span className="bg-amber-tag/10 text-amber-tag text-xs font-bold px-2 py-0.5 rounded-badges">{pendingInvites}</span>}
              </h2>
            </div>

            {invsLoading ? (
              <div className="space-y-3"><div className="h-16 bg-sky-wash/50 rounded-cards animate-pulse"></div></div>
            ) : !invitations || invitations.items.filter((i: any) => i.status === 'PENDING').length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-ash">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.items.filter((i: any) => i.status === 'PENDING').slice(0, 3).map((inv: any) => (
                  <div key={inv.id} className="border border-slate-custom/10 rounded-cards p-3 hover:border-signal-blue/30 transition-colors">
                    <p className="text-sm font-medium text-graphite truncate">{inv.campaign_title}</p>
                    <p className="text-xs text-ash mt-0.5 mb-3">{formatNepaliCurrency(inv.campaign_budget)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActionConfirm({ id: inv.id, action: "accept" })}
                        disabled={acceptMutation.isPending}
                        className="flex-1 h-8 hero-blue-fade text-white rounded-button text-xs font-medium hover:opacity-90 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setActionConfirm({ id: inv.id, action: "reject" })}
                        disabled={rejectMutation.isPending}
                        className="flex-1 h-8 bg-white border border-coral-alert/20 text-coral-alert rounded-button text-xs font-medium hover:bg-coral-alert/10 disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
                <Link to="/promoter/invitations" className="block w-full text-center text-xs font-medium text-ash hover:text-signal-blue pt-2">View all invitations</Link>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-5">
            <h2 className="text-sm font-medium text-graphite mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/promoter/marketplace" className="p-3 bg-linen-canvas rounded-cards hover:bg-sky-wash transition-colors text-center">
                <Store size={18} className="mx-auto text-signal-blue mb-1.5" />
                <span className="text-xs font-medium text-graphite">Marketplace</span>
              </Link>
              <Link to="/promoter/profile" className="p-3 bg-linen-canvas rounded-cards hover:bg-sky-wash transition-colors text-center">
                <User size={18} className="mx-auto text-signal-blue mb-1.5" />
                <span className="text-xs font-medium text-graphite">Edit Profile</span>
              </Link>
              <Link to="/promoter/profile" className="p-3 bg-linen-canvas rounded-cards hover:bg-sky-wash transition-colors text-center">
                <Briefcase size={18} className="mx-auto text-signal-blue mb-1.5" />
                <span className="text-xs font-medium text-graphite">Portfolio</span>
              </Link>
              <Link to="/promoter/profile" className="p-3 bg-linen-canvas rounded-cards hover:bg-sky-wash transition-colors text-center">
                <Star size={18} className="mx-auto text-signal-blue mb-1.5" />
                <span className="text-xs font-medium text-graphite">Reviews</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {actionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-ink/60 p-4">
          <div className="bg-white border border-slate-custom/10 rounded-cards-lg p-6 shadow-feature-section max-w-sm w-full relative">
            <h3 className="text-heading text-graphite mb-2">
              {actionConfirm.action === 'accept' ? 'Accept Offer' : 'Decline Offer'}
            </h3>
            <p className="text-sm text-ash mb-6">
              {actionConfirm.action === 'accept'
                ? 'Are you sure you want to accept this invitation? This will instantly start a new collaboration project.'
                : 'Are you sure you want to decline? The business will be notified.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setActionConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-custom bg-linen-canvas border border-slate-custom/20 rounded-button hover:bg-sky-wash transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className={`px-6 py-2 text-sm font-medium text-white rounded-button transition-opacity disabled:opacity-50 ${actionConfirm.action === 'accept' ? 'hero-blue-fade' : 'bg-coral-alert hover:bg-coral-alert/90'}`}
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
