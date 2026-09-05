import { Suspense } from "react";
import { use } from "react";
import Link from "next/link";
import { usePublicPromoterProfile } from "@/features/discovery/api";
import { useUserRating } from "@/features/reviews/api";
import { Spinner } from "@/components/ui/Spinner";
import { PublicLayout } from "@/components/common/PublicLayout";
import { RatingStars } from "@/components/reviews/RatingStars";
import { FollowButton } from "@/components/social/FollowButton";
import { InAppFollowersCount } from "@/components/social/InAppFollowersCount";
import { MapPin, Users, TrendingUp, Briefcase, LinkIcon, Camera, Music, Video, Globe, MessageSquare } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return {
    title: `${username} — B2P Connect`,
    description: `View ${username}'s promoter profile on B2P Connect.`,
    openGraph: {
      title: `${username} — B2P Connect`,
      description: `View ${username}'s promoter profile on B2P Connect.`,
      type: "profile",
    },
  };
}

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

function PromoterProfileContent({ username }: { username: string }) {
  const { data: profile, isLoading, isError } = usePublicPromoterProfile(username);
  const { data: ratingSummary } = useUserRating(profile?.userId ?? "");

  if (isLoading) return <Spinner />;
  if (isError || !profile)
    return <p className="text-body text-coral-alert">Could not load this promoter.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-start gap-6">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-signal-blue/10 text-3xl font-bold text-signal-blue">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={`${profile.username} avatar`} className="h-full w-full rounded-full object-cover" />
            ) : (
              profile.username[0].toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-graphite">{profile.username}</h1>
              {profile.verified && (
                <span className="rounded bg-sky-wash px-2 py-0.5 text-xs font-medium text-signal-blue">Verified</span>
              )}
            </div>
            {profile.headline && <p className="mt-1 mb-3 text-lg text-graphite">{profile.headline}</p>}
            <div className="mt-1">
              <FollowButton userId={profile.userId} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-ash">
              {(profile.niches?.length ? profile.niches : profile.niche ? [profile.niche] : []).slice(0, 3).map((n) => (
                <span key={n} className="rounded bg-sky-wash px-2 py-0.5 text-xs font-medium text-signal-blue">{n}</span>
              ))}
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin size={14} />{profile.location}</span>
              )}
            </div>
            {profile.socialLinks.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
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
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-graphite">Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-wash"><Users size={20} className="text-signal-blue" /></div>
              <div>
                <p className="text-xs text-ash">Audience</p>
                <p className="font-bold text-graphite">{formatCompactNumber(profile.followersCount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-wash"><Users size={20} className="text-signal-blue" /></div>
              <div>
                <p className="text-xs text-ash">In-app followers</p>
                <p className="font-bold text-graphite">
                  <InAppFollowersCount userId={profile.userId} fallback={profile.inAppFollowers} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-wash"><TrendingUp size={20} className="text-signal-blue" /></div>
              <div>
                <p className="text-xs text-ash">Engagement</p>
                <p className="font-bold text-graphite">{profile.engagementRate}%</p>
              </div>
            </div>
            {profile.yearsExperience != null && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-wash"><Briefcase size={20} className="text-signal-blue" /></div>
                <div>
                  <p className="text-xs text-ash">Experience</p>
                  <p className="font-bold text-graphite">{profile.yearsExperience} yrs</p>
                </div>
              </div>
            )}
          </div>
          {ratingSummary && ratingSummary.totalReviews > 0 && (
            <div className="mt-4 border-t border-slate-custom/10 pt-4">
              <p className="mb-1 text-xs text-ash">Rating</p>
              <div className="flex items-center gap-2">
                <RatingStars value={ratingSummary.averageRating} />
                <span className="text-sm text-ash">({ratingSummary.totalReviews})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {profile.bio && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-bold text-graphite">About</h2>
          <p className="text-body text-ash whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      {profile.portfolioItems.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-graphite">Portfolio</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.portfolioItems.map((item) => (
              <div key={item.id} className="rounded-inputs border border-slate-custom/10 overflow-hidden">
                {item.coverImage && (
                  <img src={item.coverImage} alt={item.title} className="h-32 w-full object-cover" />
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-graphite">{item.title}</h3>
                  {item.clientName && <p className="text-xs text-ash">{item.clientName}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-signal-blue/20 bg-sky-wash/50 p-6 text-center">
        <p className="text-body text-graphite">Interested in working with {profile.username}?</p>
        <Link href="/register" className="mt-3 inline-block rounded-buttons bg-signal-blue px-6 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity">
          Sign up to connect
        </Link>
      </div>
    </div>
  );
}

export default function PublicPromoterProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  return (
    <PublicLayout>
      <Suspense fallback={<Spinner />}>
        <PromoterProfileContent username={decodeURIComponent(username)} />
      </Suspense>
    </PublicLayout>
  );
}
