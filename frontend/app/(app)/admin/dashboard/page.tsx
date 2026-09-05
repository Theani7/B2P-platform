"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { useAuth } from "@/providers/AuthProvider";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/Stats";
import { Spinner } from "@/components/ui/Spinner";
import { useAdminDashboard, useAdminAnalytics } from "@/features/admin/api";
import {
  Users,
  Megaphone,
  Handshake,
  Star,
  Store,
  FileText,
  BadgeCheck,
  Percent,
  ShieldCheck,
  Settings,
  ArrowRight,
} from "lucide-react";

const AnalyticsCharts = dynamic(
  () => import("@/components/charts/AdminAnalyticsCharts"),
  { ssr: false, loading: () => <div className="h-[400px] flex items-center justify-center"><Spinner /></div> }
);

const QUICK_ACTIONS = [
  { label: "All Users", desc: "Manage accounts", href: "/admin/users", icon: Users },
  { label: "Verification", desc: "Review requests", href: "/admin/verification", icon: ShieldCheck },
  { label: "Campaigns", desc: "Moderate campaigns", href: "/admin/campaigns", icon: Megaphone },
  { label: "Reviews", desc: "Moderate reviews", icon: Star, href: "/admin/reviews" },
  { label: "Settings", desc: "Platform config", href: "/admin/settings", icon: Settings },
];

function DashboardInner() {
  const { user } = useAuth();
  const { data: dash, isLoading } = useAdminDashboard();
  const { data: analytics } = useAdminAnalytics();

  if (isLoading) return <Spinner full />;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(" ")[0] || user?.username || "Admin"}`}
        subtitle={`${today} — here's what's happening on the platform.`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={dash?.totalUsers ?? 0} icon={Users} hint="all roles" />
        <StatCard label="Campaigns" value={dash?.totalCampaigns ?? 0} icon={Megaphone} hint="all statuses" />
        <StatCard label="Collaborations" value={dash?.totalCollaborations ?? 0} icon={Handshake} hint="active + completed" />
        <StatCard label="Avg rating" value={dash?.averageRating ?? 0} icon={Star} hint={`across ${dash?.totalReviews ?? 0} reviews`} />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Businesses" value={dash?.totalBusinesses ?? 0} icon={Store} />
        <StatCard label="Promoters" value={dash?.totalPromoters ?? 0} icon={Users} hint={`${dash?.verifiedPromoters ?? 0} verified`} />
        <StatCard label="Applications" value={dash?.totalApplications ?? 0} icon={FileText} />
        <StatCard label="Reviews" value={dash?.totalReviews ?? 0} icon={Star} />
        <StatCard label="Acceptance" value={`${analytics?.acceptanceRate ?? 0}%`} icon={Percent} hint="of collaborations" />
        <StatCard label="Open verifications" value={dash?.openVerificationRequests ?? 0} icon={BadgeCheck} hint="needs review" />
      </div>

      {(dash?.openVerificationRequests ?? 0) > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-tag/30 bg-amber-tag/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-tag/15 text-amber-tag">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-body font-semibold text-midnight-ink">
                {dash?.openVerificationRequests} verification{dash?.openVerificationRequests === 1 ? "" : "s"} waiting
              </p>
              <p className="text-caption text-slate-custom">Creators and businesses are waiting for approval.</p>
            </div>
          </div>
          <Link
            href="/admin/verification"
            className="inline-flex items-center gap-1.5 rounded-pill bg-signal-blue px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity"
          >
            Review now <ArrowRight size={14} />
          </Link>
        </Card>
      )}

      {analytics ? (
        <AnalyticsCharts data={analytics} />
      ) : (
        <Card className="h-[200px] flex items-center justify-center"><Spinner /></Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="mb-1 text-heading-sm font-semibold text-midnight-ink">Moderation</h2>
          <p className="mb-4 text-caption text-slate-custom">Jump to the queues that need you.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group flex items-center gap-3 rounded-cards border border-slate-custom/10 p-4 hover:border-signal-blue/40 hover:bg-sky-wash/40 transition-all"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-buttons bg-sky-wash text-signal-blue group-hover:bg-signal-blue group-hover:text-white transition-colors">
                  <a.icon size={18} />
                </span>
                <span>
                  <span className="block text-body font-semibold text-midnight-ink">{a.label}</span>
                  <span className="block text-caption text-slate-custom">{a.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-heading-sm font-semibold text-midnight-ink">Engagement</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-body text-slate-custom">Acceptance rate</span>
              <Badge tone="emerald">{analytics?.acceptanceRate ?? 0}%</Badge>
            </div>
            <div>
              <p className="mb-2 text-caption uppercase tracking-wide text-steel">Top niches</p>
              <div className="flex flex-wrap gap-2">
                {analytics && Object.keys(analytics.topNiches).length > 0 ? (
                  Object.entries(analytics.topNiches).map(([k, v]) => (
                    <Badge key={k} tone="signal">{k}: {v as number}</Badge>
                  ))
                ) : (
                  <span className="text-caption text-slate-custom">No data yet.</span>
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 text-caption uppercase tracking-wide text-steel">Top locations</p>
              <div className="flex flex-wrap gap-2">
                {analytics && Object.keys(analytics.topLocations).length > 0 ? (
                  Object.entries(analytics.topLocations).map(([k, v]) => (
                    <Badge key={k} tone="slate">{k}: {v as number}</Badge>
                  ))
                ) : (
                  <span className="text-caption text-slate-custom">No data yet.</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireAuth role={Role.ADMIN}>
      <DashboardInner />
    </RequireAuth>
  );
}
