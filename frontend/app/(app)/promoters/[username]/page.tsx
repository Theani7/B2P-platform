"use client";

import { useState } from "react";
import { use } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import { Role } from "@/lib/roles";
import { usePublicPromoterProfile, useSavePromoter } from "@/features/discovery/api";
import { useUserRating } from "@/features/reviews/api";
import { useUserAchievements } from "@/features/achievements/api";
import { RatingStars } from "@/components/reviews/RatingStars";
import { InvitePromoterModal } from "@/components/InvitePromoterModal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "react-hot-toast";
import { MapPin, Users, TrendingUp, Briefcase, LinkIcon, Camera, Music, Video, Globe, MessageSquare, Trophy, Send, Check, Medal } from "lucide-react";

function formatCompactNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "INSTAGRAM": return <Camera size={16} />;
    case "TIKTOK": return <Music size={16} />;
    case "YOUTUBE": return <Video size={16} />;
    case "FACEBOOK": return <Globe size={16} />;
    case "LINKEDIN": return <Briefcase size={16} />;
    case "X": return <MessageSquare size={16} />;
    default: return <LinkIcon size={16} />;
  }
};

function PromoterProfileInner({ username }: { username: string }) {
  const { user } = useAuth();
  const { data: profile, isLoading, isError } = usePublicPromoterProfile(username);
  const { data: ratingSummary } = useUserRating(profile?.userId ?? "");
  const { data: achievementsData } = useUserAchievements(profile?.userId ?? "");
  const savePromoter = useSavePromoter();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  if (isLoading) return <Spinner />;
  if (isError || !profile)
    return <p className="text-body text-coral-alert">Could not load this promoter.</p>;

  const handleSave = () => {
    if (!profile) return;
    savePromoter.mutate(profile.id, {
      onSuccess: () => toast.success("Promoter saved to shortlist"),
      onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
    });
  };

  const earnedAchievements = (achievementsData?.achievements ?? []).filter((a) => a.earnedAt);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <a href="/business/promoters" className="inline-block text-sm text-primary hover:underline">
        &larr; Back to directory
      </a>

      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-start gap-6">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-signal-blue/10 text-3xl font-bold text-signal-blue">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              profile.username[0].toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-graphite">{profile.username}</h1>
                  {profile.verified && (
                    <span className="rounded bg-sky-wash px-2 py-0.5 text-xs font-medium text-signal-blue">
                      Verified
                    </span>
                  )}
                </div>
                {profile.headline && (
                  <p className="mt-1 mb-3 text-lg text-graphite">{profile.headline}</p>
                )}
                {profile.socialLinks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3">
                    {profile.socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-full border border-steel/20 bg-steel/5 px-3 py-1.5 text-sm font-medium text-graphite transition-colors hover:bg-steel/10"
                      >
                        {getPlatformIcon(link.platform)}
                        {link.username ?? link.platform}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {user?.role === Role.BUSINESS && (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={savePromoter.isPending}
                      className="rounded bg-steel/10 px-4 py-2 text-sm font-medium text-graphite transition-colors hover:bg-steel/20 disabled:opacity-50"
                    >
                      Save to Shortlist
                    </button>
                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="flex items-center gap-2 rounded bg-signal-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-signal-blue/90"
                    >
                      <Send size={16} /> Invite to Campaign
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-graphite">
              {profile.niche && (
                <span className="rounded bg-steel/10 px-2 py-1 text-xs font-medium">{profile.niche}</span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-steel" /> {profile.location}</span>
              )}
              <span className="flex items-center gap-1.5"><Users size={14} className="text-steel" /> {formatCompactNumber(profile.followersCount)} followers</span>
              <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-steel" /> {profile.engagementRate.toFixed(1)}% engagement rate</span>
              {profile.yearsExperience != null && (
                <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-steel" /> {profile.yearsExperience} year{profile.yearsExperience !== 1 ? "s" : ""} experience</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {ratingSummary && ratingSummary.totalReviews > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-graphite">Rating &amp; Reviews</h2>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-graphite">{ratingSummary.averageRating}</div>
              <RatingStars value={ratingSummary.averageRating} size="sm" />
              <p className="mt-1 text-sm text-steel">
                {ratingSummary.totalReviews} review{ratingSummary.totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingSummary.distribution[`star_${star}`] || 0;
                const pct = ratingSummary.totalReviews > 0 ? (count / ratingSummary.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-6 text-right text-graphite">{star}</span>
                    <div className="h-2 flex-1 rounded-full bg-steel/20">
                      <div className="h-2 rounded-full bg-amber-tag" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-steel">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {earnedAchievements.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6 flex items-center gap-2">
            <Trophy size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-graphite">Creator Achievements</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {earnedAchievements.slice(0, 4).map((ua) => (
              <div key={ua.id ?? ua.achievementId} className="flex items-center gap-3 rounded-lg border border-steel/10 bg-steel/5 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-blue/10 text-xl text-signal-blue">
                  <Medal size={20} className="text-amber-tag" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-graphite">{ua.achievement.title}</p>
                  <p className="text-xs text-steel">{ua.achievement.points} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.bio && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-graphite">About</h2>
          <p className="whitespace-pre-wrap text-graphite">{profile.bio}</p>
        </div>
      )}

      {profile.portfolioItems.length > 0 && (
        <div className="mt-8 rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-graphite">Portfolio</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {profile.portfolioItems.map((item) => (
              <div key={item.id} className="rounded-cards border border-steel/10 p-4">
                {item.coverImage && (
                  <img src={item.coverImage} alt={item.title} className="mb-3 h-32 w-full rounded-images object-cover" />
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-graphite">{item.title}</h3>
                  {item.featured && <Badge tone="amber">Featured</Badge>}
                </div>
                {item.campaignType && <p className="text-caption text-steel">{item.campaignType}</p>}
                {item.description && <p className="mt-1 text-body text-slate-custom">{item.description}</p>}
                {item.platforms && item.platforms.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.platforms.map((p) => (
                      <Badge key={p}>{p}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.socialLinks.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-graphite">Social Links</h2>
          <div className="flex flex-wrap gap-3">
            {profile.socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded border px-4 py-2 text-sm hover:bg-steel/5"
              >
                {getPlatformIcon(link.platform)}
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      )}

      <InvitePromoterModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        promoter={{ id: profile.id, username: profile.username }}
      />
    </div>
  );
}

export default function PromoterProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  return (
    <RequireAuth>
      <PromoterProfileInner username={decodeURIComponent(username)} />
    </RequireAuth>
  );
}
