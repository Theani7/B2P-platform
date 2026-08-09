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

const COLORS = ["#145aff", "#16ca2e", "#ffa64d", "#f26052", "#374151"];

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
      <div className="bg-white border border-slate-custom/10 rounded-cards p-5 shadow-product-card">
        <h2 className="text-heading text-graphite mb-1">Platform Activity Trend</h2>
        <p className="text-sm text-ash mb-6">Applications and Collaborations over the last 6 months</p>
        <div className="h-[300px] w-full">
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
                <XAxis dataKey="month" allowDuplicatedCategory={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4fe" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #f0f4fe', boxShadow: 'rgba(0,0,0,0.1) 0px 0px 4px -2px' }}
                  itemStyle={{ color: '#14141e', fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" data={trendData} dataKey="value" name="Applications" stroke="#145aff" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                <Area type="monotone" data={collabData} dataKey="value" name="Collaborations" stroke="#16ca2e" strokeWidth={2} fillOpacity={1} fill="url(#colorCollabs)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-ash text-sm">
              {loading ? <Spinner /> : "No analytics available yet."}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-custom/10 rounded-cards p-5 shadow-product-card">
          <h2 className="text-heading-sm text-graphite mb-1">Application Status</h2>
          <p className="text-sm text-ash mb-6">Distribution of your campaign applications</p>
          <div className="h-[220px] w-full">
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #f0f4fe', boxShadow: 'rgba(0,0,0,0.1) 0px 0px 4px -2px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-fog text-sm">No data</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-custom/10 rounded-cards p-5 shadow-product-card">
          <h2 className="text-heading-sm text-graphite mb-1">Top Campaigns</h2>
          <p className="text-sm text-ash mb-6">By number of applications received</p>
          <div className="h-[220px] w-full">
            {topData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f4fe" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 11, fill: '#374151' }} />
                  <Tooltip cursor={{ fill: '#fcfcfc' }} />
                  <Bar dataKey="value" name="Applications" fill="#145aff" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-fog text-sm">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
