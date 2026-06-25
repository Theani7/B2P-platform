import { useParams, Link } from "react-router-dom";
import { usePublicPromoterProfile, useSavePromoter } from "../features/discovery/api";
import { useUserRating } from "../features/reviews/api";
import RatingStars from "../components/reviews/RatingStars";
import LoadingSpinner from "../components/LoadingSpinner";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { MapPin, Users, TrendingUp, Briefcase, Link as LinkIcon, Camera, Music, Video, Globe, MessageSquare } from "lucide-react";

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

export default function PublicPromoterProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading } = usePublicPromoterProfile(username ?? "");
  const { data: ratingSummary } = useUserRating(profile?.user_id ?? "");
  const savePromoter = useSavePromoter();

  const handleSave = () => {
    if (!profile) return;
    savePromoter.mutate(profile.id, {
      onSuccess: () => notifySuccess("Promoter saved to shortlist"),
      onError: (e) => notifyError(e.message),
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center">
        <h1 className="text-2xl font-bold text-text">Promoter not found</h1>
        <Link to="/business/promoters" className="mt-4 inline-block text-primary hover:underline">
          Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <Link to="/business/promoters" className="inline-block text-sm text-primary hover:underline">
        &larr; Back to directory
      </Link>

      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-start gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              profile.username[0].toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-text">{profile.username}</h1>
                  {profile.verified && (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Verified
                    </span>
                  )}
                </div>
                {profile.headline && (
                  <p className="mt-1 text-lg text-gray-600">{profile.headline}</p>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={savePromoter.isPending}
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                Save to Shortlist
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {profile.niche && (
                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium">{profile.niche}</span>
              )}
              {profile.location && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {profile.location}</span>}
              <span className="flex items-center gap-1.5"><Users size={14} className="text-gray-400" /> {profile.followers_count.toLocaleString()} followers</span>
              <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-gray-400" /> {profile.engagement_rate.toFixed(1)}% engagement rate</span>
              {profile.years_experience != null && (
                <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-gray-400" /> {profile.years_experience} year{profile.years_experience !== 1 ? "s" : ""} experience</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {ratingSummary && ratingSummary.total_reviews > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-text">Rating & Reviews</h2>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-text">{ratingSummary.average_rating}</div>
              <RatingStars rating={ratingSummary.average_rating} size="sm" />
              <p className="mt-1 text-sm text-gray-500">{ratingSummary.total_reviews} review{ratingSummary.total_reviews !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = (ratingSummary.distribution as any)[`star_${star}`] || 0;
                const pct = ratingSummary.total_reviews > 0 ? (count / ratingSummary.total_reviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-6 text-right text-gray-600">{star}</span>
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {profile.bio && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-text">About</h2>
          <p className="whitespace-pre-wrap text-gray-700">{profile.bio}</p>
        </div>
      )}

      {profile.portfolio_items.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-text">Portfolio</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.portfolio_items.map((item) => (
              <div key={item.id} className="rounded-lg border bg-gray-50 p-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="mb-2 h-40 w-full rounded object-cover" />
                )}
                <h3 className="font-medium text-text">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                )}
                {item.external_link && (
                  <a
                    href={item.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    View project &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.social_links.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-text">Social Links</h2>
          <div className="flex flex-wrap gap-3">
            {profile.social_links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded border px-4 py-2 text-sm hover:bg-gray-50"
              >
                {getPlatformIcon(link.platform)}
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
