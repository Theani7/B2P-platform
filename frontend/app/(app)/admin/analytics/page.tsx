"use client";

import dynamic from "next/dynamic";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/Stats";
import { Spinner } from "@/components/ui/Spinner";
import { useAdminAnalytics } from "@/features/admin/api";

const AnalyticsCharts = dynamic(
  () => import("@/components/charts/AdminAnalyticsCharts"),
  { ssr: false, loading: () => <div className="h-[400px] flex items-center justify-center"><Spinner /></div> }
);

function AnalyticsInner() {
  const { data, isLoading } = useAdminAnalytics();
  if (isLoading) return <Spinner full />;
  if (!data) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-body text-slate-custom">No analytics available.</p>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      <PageHeader title="Analytics" subtitle="Platform-wide metrics and trends." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Users" value={data.totalUsers} />
        <StatCard label="Businesses" value={data.totalBusinesses} />
        <StatCard label="Promoters" value={data.totalPromoters} />
        <StatCard label="Verified promoters" value={data.verifiedPromoters} />
        <StatCard label="Campaigns" value={data.totalCampaigns} />
        <StatCard label="Applications" value={data.totalApplications} />
        <StatCard label="Collaborations" value={data.totalCollaborations} />
        <StatCard label="Reviews" value={data.totalReviews} />
        <StatCard label="Avg rating" value={data.averageRating} />
        <StatCard label="Acceptance rate" value={`${data.acceptanceRate}%`} hint="of collaborations" />
      </div>

      <AnalyticsCharts data={data} />
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <RequireAuth role={Role.ADMIN}>
      <AnalyticsInner />
    </RequireAuth>
  );
}
