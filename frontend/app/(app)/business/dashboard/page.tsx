"use client";

export const dynamic = "force-dynamic";

import nextDynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useBusinessAnalytics } from "@/features/analytics/api";
import { useBusinessApplications } from "@/features/applications/api";
import { ProfileCompletionWidget } from "@/components/profile/ProfileCompletionWidget";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Spinner } from "@/components/ui/Spinner";
import { useProfileCompletion } from "@/features/profile-completion/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  MegaphoneSimple,
  Handshake,
  UsersThree,
  CurrencyDollar,
  Eye,
  CheckCircle,
  TrendUp,
  Plus,
  MagnifyingGlass,
  CaretRight,
  FolderOpen,
  Sparkle,
} from "@phosphor-icons/react";

const DashboardCharts = nextDynamic(
  () => import("@/components/charts/BusinessDashboardCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="lg:col-span-2 h-[300px] flex items-center justify-center bg-white border border-steel/10 rounded-2xl shadow-product-card">
        <Spinner />
      </div>
    ),
  }
);

function DashboardInner() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: analytics, isLoading: statsLoading } = useBusinessAnalytics();
  const { data: applicationsData, isLoading: recentApplicationsLoading } = useBusinessApplications({ limit: 5 });
  const { data: profileCompletion, isLoading: completionLoading } = useProfileCompletion();

  useEffect(() => {
    if (!completionLoading && profileCompletion && profileCompletion.completion < 50) {
      router.replace("/business/profile");
    }
  }, [completionLoading, profileCompletion, router]);

  const recentApplications = applicationsData?.items ?? [];

  return (
    <div className="max-w-[1240px] mx-auto space-y-8 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 120% at 100% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0) 60%)" }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-midnight-ink">
                Overview
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[11px] font-semibold bg-emerald-status/10 text-emerald-status border border-emerald-status/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-status animate-pulse" /> Live
              </span>
            </div>
            <p className="text-sm text-ash mt-2">
              Welcome back, {user?.fullName?.split(" ")[0] || "there"}. Here&apos;s what&apos;s happening with your brand today.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <Link
              href="/business/promoters"
              className="inline-flex items-center gap-2 h-11 px-5 bg-white border border-slate-custom/20 text-slate-custom rounded-pill text-sm font-medium hover:bg-sky-wash transition-colors shadow-sm"
            >
              <MagnifyingGlass size={16} weight="bold" />
              <span>Find Promoters</span>
            </Link>
            <Link
              href="/business/campaigns/create"
              className="inline-flex items-center gap-2 h-11 px-5 bg-signal-blue hover:bg-signal-blue/90 text-white rounded-pill text-sm font-semibold shadow-product-card transition-all hover:shadow-elevated"
            >
              <Plus size={16} weight="bold" />
              <span>Create Campaign</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-signal-blue/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-sky-wash text-signal-blue flex items-center justify-center flex-shrink-0">
            <MegaphoneSimple size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Active Campaigns</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-midnight-ink">
                {statsLoading ? "—" : analytics?.summary.active_campaigns ?? 0}
              </span>
              <span className="text-[11px] text-fog truncate">
                of {analytics?.summary.total_campaigns ?? 0} total
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-emerald-status/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-status/10 text-emerald-status flex items-center justify-center flex-shrink-0">
            <Handshake size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Active Collabs</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-midnight-ink">
                {statsLoading ? "—" : analytics?.summary.active_collaborations ?? 0}
              </span>
              {(analytics?.growth.collaboration_growth ?? 0) !== 0 && (
                <span className="text-[10px] font-mono font-semibold text-emerald-status">
                  +{(analytics?.growth.collaboration_growth ?? 0)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-amber-tag/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-tag/15 text-amber-tag flex items-center justify-center flex-shrink-0">
            <UsersThree size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Applications</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-midnight-ink">
                {statsLoading ? "—" : analytics?.summary.total_applications ?? 0}
              </span>
              {(analytics?.growth.application_growth ?? 0) !== 0 && (
                <span className="text-[10px] font-mono font-semibold text-signal-blue">
                  +{(analytics?.growth.application_growth ?? 0)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-steel/10 rounded-2xl p-4 shadow-product-card flex items-center gap-3.5 hover:border-signal-blue/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-sky-wash text-signal-blue flex items-center justify-center flex-shrink-0">
            <CurrencyDollar size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ash uppercase tracking-wider truncate">Total Investment</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold font-mono text-midnight-ink">
                {statsLoading ? "—" : `$${(analytics?.summary.total_spent ?? 0).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Performance Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-steel/10 rounded-xl px-4 py-3 shadow-product-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Eye size={16} weight="bold" className="text-signal-blue flex-shrink-0" />
            <span className="text-xs font-medium text-ash">Profile Views</span>
          </div>
          <span className="text-sm font-bold font-mono text-graphite">
            {statsLoading ? "—" : (analytics?.summary.profile_views ?? 0).toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-steel/10 rounded-xl px-4 py-3 shadow-product-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle size={16} weight="bold" className="text-emerald-status flex-shrink-0" />
            <span className="text-xs font-medium text-ash">Completed Collabs</span>
          </div>
          <span className="text-sm font-bold font-mono text-graphite">
            {statsLoading ? "—" : (analytics?.summary.collaborations_completed ?? 0).toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-steel/10 rounded-xl px-4 py-3 shadow-product-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendUp size={16} weight="bold" className="text-emerald-status flex-shrink-0" />
            <span className="text-xs font-medium text-ash">Average ROI</span>
          </div>
          <span className="text-sm font-bold font-mono text-graphite">
            {statsLoading ? "—" : `${analytics?.summary.average_roi ?? 0}%`}
          </span>
        </div>

        <div className="bg-white border border-steel/10 rounded-xl px-4 py-3 shadow-product-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FolderOpen size={16} weight="bold" className="text-amber-tag flex-shrink-0" />
            <span className="text-xs font-medium text-ash">Campaign Growth</span>
          </div>
          <span className="text-sm font-bold font-mono text-graphite">
            {statsLoading ? "—" : `+${analytics?.growth.campaign_growth ?? 0}%`}
          </span>
        </div>
      </div>

      {/* Main Grid: Charts & Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCharts analytics={analytics ?? undefined} loading={statsLoading} />

        <div className="space-y-6">
          <ProfileCompletionWidget />

          {/* Recent Applications Card */}
          <div className="bg-white border border-steel/10 rounded-2xl shadow-product-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-steel/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-wash text-signal-blue flex items-center justify-center">
                  <UsersThree size={16} weight="bold" />
                </div>
                <h2 className="text-sm font-bold text-midnight-ink">Recent Applications</h2>
              </div>
              <Link
                href="/business/applications"
                className="text-xs font-semibold text-signal-blue hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <CaretRight size={12} weight="bold" />
              </Link>
            </div>

            {recentApplicationsLoading ? (
              <div className="p-8 flex justify-center">
                <Spinner />
              </div>
            ) : !recentApplications?.length ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-11 h-11 rounded-xl bg-sky-wash text-signal-blue flex items-center justify-center mb-2.5">
                  <Sparkle size={20} weight="bold" />
                </div>
                <p className="text-xs font-bold text-graphite">No applications yet</p>
                <p className="text-[11px] text-ash mt-0.5 max-w-xs leading-relaxed">
                  When promoters apply to your open campaigns, they&apos;ll appear here in real time.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-steel/10 flex-1">
                {recentApplications.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-3.5 hover:bg-sky-wash/50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-custom/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-steel/15">
                        {app.promoterProfile?.avatarUrl ? (
                          <img
                            src={app.promoterProfile.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-graphite">
                            {app.promoterProfile?.username?.charAt(0).toUpperCase() || "P"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-graphite truncate">
                          @{app.promoterProfile?.username || "Promoter"}
                        </p>
                        <p className="text-[11px] text-ash truncate">
                          Applied for <span className="font-semibold text-graphite">{app.campaign?.title}</span>
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/business/campaigns/${app.campaign?.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-sky-wash text-signal-blue hover:bg-signal-blue hover:text-white text-xs font-semibold transition-colors flex-shrink-0"
                    >
                      <span>Review</span>
                      <CaretRight size={11} weight="bold" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessDashboardPage() {
  return (
    <RequireAuth role={Role.BUSINESS}>
      <DashboardInner />
    </RequireAuth>
  );
}
