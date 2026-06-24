import { useParams, Link } from "react-router-dom";
import { usePublicPromoterProfile, useSavePromoter } from "../features/discovery/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { notifySuccess, notifyError } from "../hooks/useToast";

const PLATFORM_ICONS: Record<string, string> = {
  INSTAGRAM: "📸",
  TIKTOK: "🎵",
  YOUTUBE: "▶️",
  FACEBOOK: "📘",
  LINKEDIN: "💼",
  X: "𝕏",
};

export default function PublicPromoterProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading } = usePublicPromoterProfile(username ?? "");
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
              {profile.location && <span>📍 {profile.location}</span>}
              <span>👥 {profile.followers_count.toLocaleString()} followers</span>
              <span>📈 {profile.engagement_rate.toFixed(1)}% engagement rate</span>
              {profile.years_experience != null && (
                <span>💼 {profile.years_experience} year{profile.years_experience !== 1 ? "s" : ""} experience</span>
              )}
            </div>
          </div>
        </div>
      </div>

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
                <span>{PLATFORM_ICONS[link.platform] ?? "🔗"}</span>
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
