"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Card } from "@/components/ui/Card";

const COLORS = ["#145aff", "#16ca2e", "#ffa64d"];

interface AnalyticsData {
  topNiches: Record<string, number>;
  topLocations: Record<string, number>;
  totalPromoters: number;
  totalBusinesses: number;
  totalUsers: number;
}

export default function AdminAnalyticsCharts({ data }: { data: AnalyticsData }) {
  const nicheData = Object.entries(data.topNiches).map(([k, v]) => ({ name: k, value: v as number }));
  const locData = Object.entries(data.topLocations).map(([k, v]) => ({ name: k, value: v as number }));

  const userData = [
    { name: "Promoters", value: data.totalPromoters },
    { name: "Businesses", value: data.totalBusinesses },
    { name: "Admins", value: data.totalUsers - data.totalPromoters - data.totalBusinesses },
  ].filter((d) => d.value > 0);

  return (
    <>
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
    </>
  );
}
