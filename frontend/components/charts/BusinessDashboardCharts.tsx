"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Spinner } from "@/components/ui/Spinner";
import { ChartLineUp, ChartPie, Trophy } from "@phosphor-icons/react";

const COLORS = ["#145aff", "#16ca2e", "#ffa64d", "#f26052", "#696a72"];

interface ChartData {
  charts?: {
    monthly_applications?: { month: string; value: number }[];
    monthly_collaborations?: { month: string; value: number }[];
    application_status_distribution?: { name: string; value: number }[];
    top_campaigns_by_applications?: { name: string; value: number }[];
  };
}

export default function BusinessDashboardCharts({ analytics, loading }: { analytics?: ChartData; loading?: boolean }) {
  const trendData = analytics?.charts?.monthly_applications ?? [];
  const collabData = analytics?.charts?.monthly_collaborations ?? [];
  const statusData = analytics?.charts?.application_status_distribution ?? [];
  const topData = analytics?.charts?.top_campaigns_by_applications ?? [];

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Platform Activity Trend */}
      <div className="bg-white border border-steel/10 rounded-2xl p-5 shadow-product-card">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-sky-wash text-signal-blue flex items-center justify-center flex-shrink-0">
            <ChartLineUp size={18} weight="bold" />
          </div>
          <div>
            <h2 className="text-base font-bold text-midnight-ink">Platform Activity Trend</h2>
            <p className="text-xs text-ash">Applications and collaborations over the last 6 months</p>
          </div>
        </div>

        <div className="h-[280px] w-full mt-4">
          {trendData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#145aff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#145aff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCollabs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16ca2e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16ca2e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  allowDuplicatedCategory={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#696a72" }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#696a72" }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4fe" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(107,114,128,0.15)",
                    boxShadow: "rgba(0,0,0,0.08) 0px 4px 12px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#14141e", fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                <Area
                  type="monotone"
                  data={trendData}
                  dataKey="value"
                  name="Applications"
                  stroke="#145aff"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorApps)"
                />
                <Area
                  type="monotone"
                  data={collabData}
                  dataKey="value"
                  name="Collaborations"
                  stroke="#16ca2e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCollabs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-ash text-xs">
              {loading ? <Spinner /> : "No analytics available yet."}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Application Status Distribution */}
        <div className="bg-white border border-steel/10 rounded-2xl p-5 shadow-product-card">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-status/10 text-emerald-status flex items-center justify-center flex-shrink-0">
              <ChartPie size={18} weight="bold" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-midnight-ink">Application Status</h2>
              <p className="text-[11px] text-ash">Distribution of received applications</p>
            </div>
          </div>

          <div className="h-[210px] w-full mt-3">
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgba(107,114,128,0.15)",
                      boxShadow: "rgba(0,0,0,0.08) 0px 4px 12px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-fog text-xs">No data yet</div>
            )}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="bg-white border border-steel/10 rounded-2xl p-5 shadow-product-card">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-tag/15 text-amber-tag flex items-center justify-center flex-shrink-0">
              <Trophy size={18} weight="bold" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-midnight-ink">Top Campaigns</h2>
              <p className="text-[11px] text-ash">By applications received</p>
            </div>
          </div>

          <div className="h-[210px] w-full mt-3">
            {topData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f4fe" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={90}
                    tick={{ fontSize: 11, fill: "#696a72" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f0f4fe" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgba(107,114,128,0.15)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" name="Applications" fill="#145aff" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-fog text-xs">No data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
