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
import { usePromoterProfile, useUpdatePromoterProfile } from "@/features/profile/api";
import { useUserRating } from "@/features/reviews/api";
import { useUpload } from "@/features/upload/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useQueryClient } from "@tanstack/react-query";
import { useProfileCompletion } from "@/features/profile-completion/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Handshake,
  Star,
  Camera,
  Mail,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

function DashboardInner() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUpload("avatar");
  const updateProfile = useUpdatePromoterProfile();

  const { data: profileCompletion, isLoading: completionLoading } = useProfileCompletion();

  useEffect(() => {
    if (!completionLoading && profileCompletion && profileCompletion.completion < 50) {
      router.replace("/promoter/profile");
    }
  }, [completionLoading, profileCompletion, router]);

  // Fetch PENDING invitations with a larger page size so the count is accurate
  const { data: invitations, isLoading: invsLoading } = usePromoterInvitations({ status: "PENDING", limit: 20 });
  // Fetch only ACTIVE collaborations from the server for accurate stats + preview
  const { data: collabs, isLoading: collabsLoading } = usePromoterCollaborations({ status: "ACTIVE", limit: 5 });
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
      {/* SIGNATURE HERO BANNER */}
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 120% at 100% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0) 60%)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative group w-fit shrink-0">
              {avatarUploading ? (
                <div className="w-20 h-20 rounded-full bg-sky-wash border-2 border-white flex items-center justify-center shadow-md">
                  <Spinner />
                </div>
              ) : (
                <Avatar
                  src={profile?.avatarUrl}
                  initials={(user?.fullName?.[0] ?? "P").toUpperCase()}
                  size="lg"
                  className="w-20 h-20 text-2xl ring-2 ring-white shadow-md"
                  colorIndex={2}
                />
              )}
              {profile?.verified && !avatarUploading && (
                <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-status text-white ring-2 ring-white" title="Verified creator">
                  <CheckCircle2 size={13} />
                </span>
              )}
              <button
                type="button"
                onClick={onCameraClick}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center border border-steel/20 hover:bg-sky-wash transition-all text-graphite disabled:opacity-50 shadow-sm opacity-0 group-hover:opacity-100"
                title="Change avatar"
              >
                <Camera size={13} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-signal-blue font-mono uppercase tracking-wider">Creator Studio</p>
              <h1 className="mt-1 truncate font-display text-3xl font-semibold tracking-tight text-midnight-ink sm:text-4xl">
                {user?.fullName ?? "Creator"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ash">
                <span className="flex items-center gap-1 font-semibold text-graphite">
                  <Star size={14} className="fill-amber-tag text-amber-tag" />
                  <span>{avgRating.toFixed(1)}</span>
                  <span className="text-ash font-normal">({reviewsReceived} {reviewsReceived === 1 ? "review" : "reviews"})</span>
                </span>
                {profile?.niche && (
                  <span className="rounded-pill bg-sky-wash px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-signal-blue border border-signal-blue/20">
                    {profile.niche}
                  </span>
                )}
                {profile?.location && (
                  <span className="text-ash flex items-center gap-1 text-[11px]">
                    {profile.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/promoter/profile"
              className="inline-flex items-center justify-center h-10 px-4 rounded-pill bg-white border border-steel/15 text-xs font-semibold text-graphite hover:border-signal-blue/40 hover:text-signal-blue transition-all shadow-sm"
            >
              Edit Profile
            </Link>
            <Link
              href="/promoter/marketplace"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-pill bg-signal-blue text-white text-xs font-semibold hover:bg-signal-blue/90 transition-all shadow-product-card"
            >
              Browse Campaigns <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-cards-lg border border-steel/10 bg-gradient-to-br from-white to-sky-wash/50 p-[1px] shadow-product-card transition-transform hover:-translate-y-0.5">
          <StatCard
            label="Pending Invites"
            value={invsLoading ? "—" : pendingInvites}
            icon={Mail}
            hint={pendingInvites > 0 ? "Action required" : "All caught up"}
            className="border-0 shadow-none bg-transparent"
          />
        </div>
        <div className="rounded-cards-lg border border-steel/10 bg-gradient-to-br from-white to-emerald-status/5 p-[1px] shadow-product-card transition-transform hover:-translate-y-0.5">
          <StatCard
            label="Active Collabs"
            value={collabsLoading ? "—" : activeCollabs}
            icon={Handshake}
            hint="In progress"
            className="border-0 shadow-none bg-transparent"
          />
        </div>
        <div className="rounded-cards-lg border border-steel/10 bg-gradient-to-br from-white to-amber-tag/10 p-[1px] shadow-product-card transition-transform hover:-translate-y-0.5">
          <StatCard
            label="Avg. Rating"
            value={reviewsReceived === 0 ? "—" : avgRating.toFixed(1)}
            icon={Star}
            hint={reviewsReceived > 0 ? `${reviewsReceived} ${reviewsReceived === 1 ? "review" : "reviews"}` : "No reviews yet"}
            className="border-0 shadow-none bg-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Collaborations */}
          <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-custom/10 bg-gradient-to-r from-sky-wash/70 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-signal-blue text-white rounded-buttons shadow-product-card">
                  <Handshake size={17} />
                </div>
                <h2 className="font-display text-lg font-medium tracking-tight text-graphite">Active Collaborations</h2>
              </div>
              <Link href="/promoter/collaborations" className="text-xs font-semibold text-signal-blue hover:opacity-75 flex items-center gap-1 rounded-pill bg-sky-wash/70 px-3 py-1.5 transition-colors">
                View All <ArrowRight size={13} />
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

          {/* Pending Invites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Pending Invitations Widget */}
            <div className="bg-white border border-slate-custom/10 rounded-cards-lg shadow-product-card overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-custom/10 bg-gradient-to-r from-amber-tag/10 to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-tag text-white rounded-buttons shadow-product-card">
                    <Mail size={17} />
                  </div>
                  <h2 className="font-display text-lg font-medium tracking-tight text-graphite">Pending Invites</h2>
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
                      <Link href="/promoter/opportunities?tab=invitations" className="block w-full text-center text-xs font-bold text-signal-blue hover:underline pt-1">
                        +{invitations.total - 3} more invitations
                      </Link>
                    )}
                    {invitations.total <= 3 && (
                      <Link href="/promoter/opportunities?tab=invitations" className="block w-full text-center text-xs font-bold text-signal-blue hover:underline pt-3">
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
