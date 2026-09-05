"use client";

export const dynamic = "force-dynamic";

import nextDynamic from "next/dynamic";
import Link from "next/link";
import { Plus, Search, FolderOpen, CheckCircle2, FolderDot, Activity as ActivityIcon } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useBusinessAnalytics } from "@/features/analytics/api";
import { useBusinessInvitations } from "@/features/invitations/api";
import { useBusinessApplications } from "@/features/applications/api";
import { StatCard } from "@/components/ui/Stats";
import { ProfileCompletionWidget } from "@/components/profile/ProfileCompletionWidget";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Spinner } from "@/components/ui/Spinner";
import { useProfileCompletion } from "@/features/profile-completion/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DashboardCharts = nextDynamic(
  () => import("@/components/charts/BusinessDashboardCharts"),
  { ssr: false, loading: () => <div className="lg:col-span-2 h-[300px] flex items-center justify-center"><Spinner /></div> }
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
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-midnight-ink">Overview</h1>
          <p className="text-body text-ash mt-2">
            Welcome back, {user?.fullName?.split(" ")[0] || "there"}. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/business/promoters"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-custom/20 text-slate-custom rounded-button text-sm font-medium hover:bg-sky-wash transition-colors"
          >
            <Search size={16} />
            Find promoters
          </Link>
          <Link
            href="/business/campaigns/create"
            className="inline-flex items-center gap-2 px-4 py-2 hero-blue-fade text-white rounded-button text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Create campaign
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Campaigns"
          value={statsLoading ? "—" : analytics?.summary.total_campaigns ?? 0}
          icon={FolderDot}
          trend={{ value: `${analytics?.growth.campaign_growth ?? 0}%`, positive: (analytics?.growth.campaign_growth ?? 0) >= 0 }}
          subtitle="from last month"
        />
        <StatCard
          label="Active Campaigns"
          value={statsLoading ? "—" : analytics?.summary.active_campaigns ?? 0}
          icon={FolderOpen}
          subtitle="currently open"
        />
        <StatCard
          label="Active Collaborations"
          value={statsLoading ? "—" : analytics?.summary.active_collaborations ?? 0}
          icon={ActivityIcon}
          trend={{ value: `${analytics?.growth.collaboration_growth ?? 0}%`, positive: (analytics?.growth.collaboration_growth ?? 0) >= 0 }}
          subtitle="from last month"
        />
        <StatCard
          label="Total Applications"
          value={statsLoading ? "—" : analytics?.summary.total_applications ?? 0}
          icon={CheckCircle2}
          trend={{ value: `${analytics?.growth.application_growth ?? 0}%`, positive: (analytics?.growth.application_growth ?? 0) >= 0 }}
          subtitle="from last month"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <StatCard
          label="Profile Views"
          value={statsLoading ? "—" : `${(analytics?.summary.profile_views ?? 0).toLocaleString()}`}
          icon={ActivityIcon}
          subtitle="based on active collabs"
        />
        <StatCard
          label="Completed Collabs"
          value={statsLoading ? "—" : `${(analytics?.summary.collaborations_completed ?? 0).toLocaleString()}`}
          icon={ActivityIcon}
          subtitle="across all platforms"
        />
        <StatCard
          label="Total Spent"
          value={statsLoading ? "—" : `Rs. ${(analytics?.summary.total_spent ?? 0).toLocaleString()}`}
          icon={FolderDot}
          subtitle="on completed collabs"
        />
        <StatCard
          label="Average ROI"
          value={statsLoading ? "—" : `${analytics?.summary.average_roi ?? 0}%`}
          icon={CheckCircle2}
          trend={{ value: "+12%", positive: true }}
          subtitle="estimated return"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCharts analytics={analytics ?? undefined} loading={statsLoading} />

        <div className="space-y-6">
          <ProfileCompletionWidget />

          <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-custom/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-ash" />
                <h2 className="text-sm font-medium text-graphite">Recent Applications</h2>
              </div>
            </div>
            {recentApplicationsLoading ? (
              <div className="p-6 flex justify-center"><Spinner /></div>
            ) : !recentApplications?.length ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-sky-wash flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} className="text-signal-blue" />
                </div>
                <p className="text-sm font-medium text-graphite">No recent applications</p>
                <p className="text-xs text-ash mt-1">When promoters apply, they&apos;ll appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-custom/10 flex-1 overflow-y-auto">
                {recentApplications.map((app: any) => (
                  <div key={app.id} className="p-4 hover:bg-sky-wash/50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-custom/10 flex items-center justify-center flex-shrink-0">
                        {app.promoterProfile?.avatarUrl ? (
                          <img src={app.promoterProfile.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-xs font-bold text-graphite">
                            {app.promoterProfile?.username?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-graphite">{app.promoterProfile?.username}</h4>
                        <p className="text-xs text-ash mt-0.5">
                          Applied for <span className="font-medium text-graphite">{app.campaign?.title}</span>
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/business/campaigns/${app.campaign?.id}`}
                      className="text-xs font-medium text-signal-blue hover:underline"
                    >
                      Review
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
