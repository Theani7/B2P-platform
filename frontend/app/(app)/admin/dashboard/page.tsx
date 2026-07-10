"use client";

import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { useAuth } from "@/providers/AuthProvider";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/Stats";
import { Spinner } from "@/components/ui/Spinner";
import { useAdminDashboard, useAdminAnalytics } from "@/features/admin/api";

function StatGrid({ stats }: { stats: Record<string, { label: string; value: number; hint?: string }> }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Object.entries(stats).map(([key, s]) => (
        <StatCard key={key} label={s.label} value={s.value} hint={s.hint} />
      ))}
    </div>
  );
}

function DashboardInner() {
  const { user } = useAuth();
  const { data: dash, isLoading } = useAdminDashboard();
  const { data: analytics } = useAdminAnalytics();

  if (isLoading) return <Spinner />;

  const stats = {
    users: { label: "Total users", value: dash?.totalUsers ?? 0 },
    businesses: { label: "Businesses", value: dash?.totalBusinesses ?? 0 },
    promoters: { label: "Promoters", value: dash?.totalPromoters ?? 0 },
    verified: { label: "Verified promoters", value: dash?.verifiedPromoters ?? 0 },
    campaigns: { label: "Campaigns", value: dash?.totalCampaigns ?? 0 },
    collaborations: { label: "Collaborations", value: dash?.totalCollaborations ?? 0 },
    reviews: { label: "Reviews", value: dash?.totalReviews ?? 0 },
    avgRating: { label: "Avg rating", value: dash?.averageRating ?? 0 },
    openVerif: { label: "Open verifications", value: dash?.openVerificationRequests ?? 0 },
  };

  return (
    <>
      <PageHeader
        title="Admin dashboard"
        subtitle={`Signed in as ${user?.fullName || user?.username}.`}
      />
      <StatGrid stats={stats} />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-heading-sm font-semibold text-midnight-ink">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Users", href: "/admin/users" },
              { label: "Campaigns", href: "/admin/campaigns" },
              { label: "Reviews", href: "/admin/reviews" },
              { label: "Settings", href: "/admin/settings" },
              { label: "Analytics", href: "/admin/analytics" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-pill bg-sky-wash px-4 py-2 text-body font-medium text-graphite hover:bg-steel/10"
              >
                {l.label}
              </a>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-heading-sm font-semibold text-midnight-ink">Engagement</h2>
          {analytics ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-body text-slate-custom">Collaboration acceptance rate</span>
                <Badge tone="emerald">{analytics.acceptanceRate}%</Badge>
              </div>
              <div>
                <p className="mb-1 text-caption uppercase tracking-wide text-steel">Top niches</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analytics.topNiches).map(([k, v]) => (
                    <Badge key={k} tone="signal">
                      {k}: {v as number}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-caption uppercase tracking-wide text-steel">Top locations</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analytics.topLocations).map(([k, v]) => (
                    <Badge key={k} tone="slate">
                      {k}: {v as number}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Spinner />
          )}
        </Card>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireAuth role={Role.ADMIN}>
      <DashboardInner />
    </RequireAuth>
  );
}
