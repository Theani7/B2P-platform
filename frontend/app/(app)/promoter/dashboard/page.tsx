"use client";

export const dynamic = "force-dynamic";

import { useRef, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { StatCard } from "@/components/ui/Stats";
import { ProfileCompletionWidget } from "@/components/profile/ProfileCompletionWidget";
import { usePromoterCollaborations } from "@/features/collaborations/api";
import { usePromoterInvitations, useAcceptInvitation, useRejectInvitation } from "@/features/invitations/api";
import { Spinner } from "@/components/ui/Spinner";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useMyActivities } from "@/features/activity/api";
import { usePromoterProfile, useUpdatePromoterProfile } from "@/features/profile/api";
import { useUserRating } from "@/features/reviews/api";
import { useUpload } from "@/features/upload/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useQueryClient } from "@tanstack/react-query";
import {
  Handshake,
  Star,
  Camera,
  Mail,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function DashboardInner() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUpload("avatar");
  const updateProfile = useUpdatePromoterProfile();

  // Fetch PENDING invitations with a larger page size so the count is accurate
  const { data: invitations, isLoading: invsLoading } = usePromoterInvitations({ status: "PENDING", limit: 20 });
  // Fetch only ACTIVE collaborations from the server for accurate stats + preview
  const { data: collabs, isLoading: collabsLoading } = usePromoterCollaborations({ status: "ACTIVE", limit: 5 });
  const { data: activityData, isLoading: activityLoading } = useMyActivities({ size: 5 });
  const { data: profile } = usePromoterProfile();
  const { data: rating } = useUserRating(user?.id ?? "");

  const pendingInvites = invitations?.total ?? 0;
  const activeCollabs = collabs?.total ?? 0;
  const avgRating = rating?.averageRating ?? 0;
  const reviewsReceived = rating?.totalReviews ?? 0;

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await uploadAvatar.mutateAsync(file);
      await updateProfile.mutateAsync({ avatarUrl: res.url } as any);
      notifySuccess("Avatar updated!");
    } catch {
      notifyError("Failed to upload avatar.");
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
        onSuccess: () => {
          notifySuccess("Invitation accepted! A new collaboration project has been created.");
          // Invalidate collaborations so the active count updates immediately
          qc.invalidateQueries({ queryKey: ["promoter-collaborations"] });
          setActionConfirm(null);
        },
        onError: (e: any) => {
          notifyError(e?.response?.data?.message ?? "Failed to accept invitation");
          setActionConfirm(null);
        },
      });
    } else {
      rejectMutation.mutate(actionConfirm.id, {
        onSuccess: () => {
          notifySuccess("Invitation declined.");
          setActionConfirm(null);
        },
        onError: (e: any) => {
          notifyError(e?.response?.data?.message ?? "Failed to decline invitation");
          setActionConfirm(null);
        },
      });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      {/* Hero Header */}
      <div className="bg-white border border-slate-custom/10 rounded-xl shadow-sm overflow-hidden border-t-4 border-t-signal-blue">
        <div className="h-24 bg-gradient-to-r from-sky-wash via-periwinkle-glow/30 to-sky-wash relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
        </div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-10">
            <div className="flex items-end gap-5">
              <div className="relative group">
                {avatarUploading ? (
                  <div className="w-24 h-24 rounded-full bg-sky-wash border-4 border-white flex items-center justify-center shadow-sm">
                    <Spinner />
                  </div>
                ) : (
                  <Avatar
                    src={profile?.avatarUrl}
                    initials={(user?.fullName?.[0] ?? "P").toUpperCase()}
                    size="lg"
                    className="w-24 h-24 text-2xl ring-4 ring-white shadow-sm"
                    colorIndex={2}
                  />
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
                  <h1 className="text-2xl font-bold text-graphite tracking-tight">{user?.fullName ?? "Creator"}</h1>
                  {profile?.verified && <CheckCircle2 size={20} className="text-emerald-status" />}
                </div>
                <p className="text-sm font-medium text-ash mt-0.5 flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-tag text-amber-tag" />
                  <span className="text-graphite font-bold">{avgRating.toFixed(1)}</span>
                  <span>({reviewsReceived} {reviewsReceived === 1 ? "review" : "reviews"})</span>
                </p>
                {profile?.niche && (
                  <p className="text-xs text-ash mt-0.5 uppercase tracking-wider font-medium">{profile.niche}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                href="/promoter/profile"
                className="flex-1 md:flex-none flex justify-center items-center h-11 px-6 rounded-inputs bg-white border border-slate-custom/10 text-sm font-bold text-graphite hover:bg-sky-wash transition-colors shadow-sm"
              >
                Edit Profile
              </Link>
              <Link
                href="/promoter/marketplace"
                className="flex-1 md:flex-none flex justify-center items-center h-11 px-6 rounded-inputs bg-signal-blue text-white text-sm font-bold hover:bg-signal-blue/90 transition-colors shadow-sm"
              >
                Browse Campaigns
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Pending Invites"
          value={invsLoading ? "—" : pendingInvites}
          icon={Mail}
          hint={pendingInvites > 0 ? "Action required" : "All caught up"}
        />
        <StatCard
          label="Active Collabs"
          value={collabsLoading ? "—" : activeCollabs}
          icon={Handshake}
          hint="In progress"
        />
        <StatCard
          label="Avg. Rating"
          value={reviewsReceived === 0 ? "—" : avgRating.toFixed(1)}
          icon={Star}
          hint={reviewsReceived > 0 ? `${reviewsReceived} ${reviewsReceived === 1 ? "review" : "reviews"}` : "No reviews yet"}
        />
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
              <Link href="/promoter/collaborations" className="text-xs font-bold text-signal-blue hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-6">
              {collabsLoading ? (
                <SkeletonList count={3} rowHeight="h-16" roundedWrapper="rounded-xl" />
              ) : !collabs || collabs.items.length === 0 ? (
                <div className="bg-sky-wash/30 border border-slate-custom/10 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center text-signal-blue mb-3">
                    <Handshake size={20} />
                  </div>
                  <p className="text-sm font-bold text-graphite mb-1">No active collaborations</p>
                  <p className="text-xs text-ash max-w-xs mx-auto">Apply to campaigns to start working with brands and earning.</p>
                  <Link
                    href="/promoter/marketplace"
                    className="mt-4 px-4 h-9 flex items-center justify-center rounded-inputs bg-white border border-slate-custom/10 text-xs font-bold text-graphite shadow-sm hover:bg-sky-wash transition-colors"
                  >
                    Find Campaigns
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {collabs.items.slice(0, 3).map((c) => (
                    <Link key={c.id} href="/promoter/collaborations" className="bg-white border border-slate-custom/10 rounded-xl p-4 shadow-sm flex items-center justify-between group hover:border-signal-blue/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-periwinkle-glow/30 text-signal-blue rounded-lg flex flex-shrink-0 items-center justify-center text-lg font-bold">
                          {c.campaignTitle?.[0]?.toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-graphite truncate">{c.campaignTitle}</p>
                          <p className="text-[11px] font-medium text-ash uppercase tracking-wider mt-1">
                            {c.partnerName} • <span className="text-emerald-status">Active</span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-custom/20 group-hover:text-signal-blue transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                  {collabs.total > 3 && (
                    <Link
                      href="/promoter/collaborations"
                      className="block w-full text-center text-xs font-bold text-signal-blue hover:underline pt-1"
                    >
                      +{collabs.total - 3} more collaborations
                    </Link>
                  )}
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
                <div className="p-6"><SkeletonList count={3} rowHeight="h-12" roundedWrapper="rounded-lg" /></div>
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
                    <div key={activity.id} className="flex items-start gap-3 px-6 py-4">
                      <div className="w-8 h-8 rounded-full bg-periwinkle-glow/30 text-signal-blue flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(activity.actorName?.[0] ?? "A").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-graphite">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-ash mt-0.5">{activity.description}</p>
                        )}
                        <p className="text-[10px] text-fog uppercase tracking-wider mt-1">{relativeTime(activity.createdAt)}</p>
                      </div>
                    </div>
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
                  {pendingInvites > 0 && (
                    <span className="bg-amber-tag text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {pendingInvites}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex flex-col">
                {invsLoading ? (
                  <SkeletonList count={2} rowHeight="h-16" roundedWrapper="rounded-lg" />
                ) : !invitations || invitations.items.length === 0 ? (
                  <div className="text-center py-8 bg-sky-wash/30 rounded-xl border border-dashed border-slate-custom/10 flex flex-col items-center justify-center">
                    <p className="text-sm font-bold text-graphite">You're all caught up!</p>
                    <p className="text-xs text-ash mt-1">No pending invitations.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.items.slice(0, 3).map((inv) => (
                      <div key={inv.id} className="border border-slate-custom/10 rounded-xl p-4 hover:border-signal-blue/30 transition-colors shadow-sm">
                        <p className="text-sm font-bold text-graphite truncate">{inv.campaign?.title ?? "Untitled Campaign"}</p>
                        <p className="text-[11px] font-medium text-ash uppercase tracking-wider mt-0.5 mb-4">
                          {inv.campaign?.businessProfile?.companyName ?? "Unknown Brand"}
                        </p>
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
                    {invitations.total > 3 && (
                      <Link href="/promoter/invitations" className="block w-full text-center text-xs font-bold text-signal-blue hover:underline pt-1">
                        +{invitations.total - 3} more invitations
                      </Link>
                    )}
                    {invitations.total <= 3 && (
                      <Link href="/promoter/invitations" className="block w-full text-center text-xs font-bold text-signal-blue hover:underline pt-3">
                        View all invitations
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileCompletionWidget />
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4">
          <div className="bg-white border border-slate-custom/10 rounded-2xl p-8 shadow-xl max-w-sm w-full relative">
            <h3 className="text-xl font-bold text-graphite mb-3">
              {actionConfirm.action === "accept" ? "Accept Invitation" : "Decline Invitation"}
            </h3>
            <p className="text-sm font-medium text-ash leading-relaxed mb-8">
              {actionConfirm.action === "accept"
                ? "Are you sure you want to accept this invitation? This will instantly start a new collaboration project and notify the brand."
                : "Are you sure you want to decline? The business will be notified."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActionConfirm(null)}
                className="px-5 py-2.5 text-sm font-bold text-graphite bg-white border border-slate-custom/10 rounded-inputs hover:bg-sky-wash transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className={`px-6 py-2.5 text-sm font-bold text-white rounded-inputs transition-colors disabled:opacity-50 shadow-sm ${
                  actionConfirm.action === "accept"
                    ? "bg-signal-blue hover:bg-signal-blue/90"
                    : "bg-coral-alert hover:bg-coral-alert/90"
                }`}
              >
                {acceptMutation.isPending || rejectMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Confirming…
                  </span>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PromoterDashboardPage() {
  return (
    <RequireAuth role={Role.PROMOTER}>
      <DashboardInner />
    </RequireAuth>
  );
}
