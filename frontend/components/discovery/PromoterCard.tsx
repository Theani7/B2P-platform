import type { PromoterDirectoryItem } from "@/features/discovery/api";
import { Badge } from "@/components/ui/Card";

function initials(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "PR";
}

export function PromoterCard({
  promoter,
  action,
}: {
  promoter: PromoterDirectoryItem;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-cards bg-white p-5 shadow-product-card">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-sky-wash text-heading-sm font-semibold text-primary">
          {promoter.avatarUrl ? (
            <img
              src={promoter.avatarUrl}
              alt={promoter.username}
              className="h-12 w-12 rounded-pill object-cover"
            />
          ) : (
            initials(promoter.username)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={`/promoters/${promoter.username}`}
              className="truncate font-medium text-midnight-ink hover:text-primary"
            >
              @{promoter.username}
            </a>
            {promoter.verified && <Badge tone="emerald">Verified</Badge>}
          </div>
          {promoter.headline && (
            <p className="truncate text-body text-slate-custom">{promoter.headline}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-caption text-steel">
            <Badge tone="signal">{promoter.niche}</Badge>
            {promoter.location && <span>{promoter.location}</span>}
          </div>
        </div>
        {action}
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-steel/10 pt-3 text-caption text-steel">
        <span>
          <span className="font-mono font-medium text-midnight-ink">
            {promoter.followersCount.toLocaleString()}
          </span>{" "}
          followers
        </span>
        <span>
          <span className="font-mono font-medium text-midnight-ink">
            {promoter.engagementRate}%
          </span>{" "}
          engagement
        </span>
        {typeof promoter.averageRating === "number" && (
          <span>
            <span className="font-mono font-medium text-midnight-ink">
              {promoter.averageRating.toFixed(1)}
            </span>{" "}
            rating
          </span>
        )}
      </div>
    </div>
  );
}
