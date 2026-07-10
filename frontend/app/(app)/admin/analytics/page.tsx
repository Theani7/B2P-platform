"use client";

import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/Stats";
import { Spinner } from "@/components/ui/Spinner";
import { useAdminAnalytics } from "@/features/admin/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";


function AnalyticsInner() {
  const { data, isLoading } = useAdminAnalytics();
  if (isLoading) return <Spinner full />;
  if (!data) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-body text-slate-custom">No analytics available.</p>
    </div>
  );

  const nicheData = Object.entries(data.topNiches).map(([k, v]) => ({ name: k, value: v as number }));
  const locData = Object.entries(data.topLocations).map(([k, v]) => ({ name: k, value: v as number }));
  
  const userData = [
    { name: "Promoters", value: data.totalPromoters },
    { name: "Businesses", value: data.totalBusinesses },
    { name: "Admins", value: data.totalUsers - data.totalPromoters - data.totalBusinesses }
  ].filter(d => d.value > 0);
  
  const COLORS = ["#145aff", "#16ca2e", "#ffa64d"];

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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="h-[400px] flex flex-col">
          <h2 className="mb-6 text-heading-sm font-semibold text-midnight-ink">Top niches</h2>
          <div className="flex-1 min-h-0">
            {nicheData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nicheData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: "#8f9fb3" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f0f2f5" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {nicheData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#145aff" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-caption text-slate-custom">No data.</p>
            )}
          </div>
        </Card>

        <Card className="h-[400px] flex flex-col">
          <h2 className="mb-6 text-heading-sm font-semibold text-midnight-ink">Top locations</h2>
          <div className="flex-1 min-h-0">
            {locData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: "#8f9fb3" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f0f2f5" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {locData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#145aff" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-caption text-slate-custom">No data.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="h-[400px] flex flex-col">
          <h2 className="mb-6 text-heading-sm font-semibold text-midnight-ink">User distribution</h2>
          <div className="flex-1 min-h-0">
            {userData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={userData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                    {userData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-caption text-slate-custom">No data.</p>
            )}
          </div>
        </Card>
      </div>
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
