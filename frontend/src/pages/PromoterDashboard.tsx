import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { usePromoterApplications, usePromoterInvitations, usePromoterCollaborations } from "../features/collaboration/api";
import { Avatar, StatCard } from "../components/ui";
import { formatNepaliCurrency } from "../utils/currency";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Handshake,
  TrendingUp,
  Users,
  Star,
  Eye,
  Bookmark,
  Calendar,
  Bell,
  Upload,
  User,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  MapPin,
  Camera,
  Mail,
  Sparkles,
  Store
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function PromoterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Real Data Hooks
  const { data: applications, isLoading: appsLoading } = usePromoterApplications({ limit: 5 });
  const { data: invitations, isLoading: invsLoading } = usePromoterInvitations({ limit: 5 });
  const { data: collabs, isLoading: collabsLoading } = usePromoterCollaborations({ limit: 5 });

  const activeApps = applications?.total ?? 0;
  const pendingInvites = invitations?.total ?? 0;
  const activeCollabs = collabs?.total ?? 0;

  // Mock Analytics Data
  const analyticsData = [
    { name: 'Jan', views: 400, invites: 24 },
    { name: 'Feb', views: 300, invites: 13 },
    { name: 'Mar', views: 550, invites: 38 },
    { name: 'Apr', views: 480, invites: 29 },
    { name: 'May', views: 720, invites: 48 },
    { name: 'Jun', views: 890, invites: 62 },
  ];

  // Mock Recommended Campaigns
  const recommendedCampaigns = [
    { id: '1', title: 'Summer Collection 2026', business: 'Nike', budget: 50000, match: 94, category: 'LIFESTYLE', location: 'Remote', logo: 'N' },
    { id: '2', title: 'Tech Review Series', business: 'Logitech', budget: 35000, match: 88, category: 'TECH', location: 'Global', logo: 'L' },
    { id: '3', title: 'Fitness App Launch', business: 'FitPro', budget: 20000, match: 82, category: 'FITNESS', location: 'New York', logo: 'F' },
  ];

  // Mock Recent Activity
  const activities = [
    { id: 1, type: 'view', text: 'Spotify viewed your profile', time: '2 hours ago', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 2, type: 'invite', text: 'Received invitation from Nike', time: '5 hours ago', icon: Mail, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 3, type: 'accept', text: 'Application accepted by Adidas', time: '1 day ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 4, type: 'review', text: '5-star review from TechCorp', time: '2 days ago', icon: Star, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      
      {/* 1. TOP HERO */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-10">
            <div className="flex items-end gap-5">
              <div className="relative">
                <Avatar initials={user?.full_name?.[0]?.toUpperCase() ?? "P"} size="lg" className="w-24 h-24 text-2xl ring-4 ring-white shadow-sm bg-white" colorIndex={2} />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center ring-1 ring-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-gray-500">
                  <Camera size={14} />
                </button>
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.full_name ?? "Creator"}</h1>
                  <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-50" />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">Lifestyle & Tech Creator • ⭐ 4.9 (12 reviews)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link to="/promoter/profile" className="flex-1 md:flex-none flex justify-center items-center h-11 px-6 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                Complete Profile
              </Link>
              <Link to="/promoter/marketplace" className="flex-1 md:flex-none flex justify-center items-center h-11 px-6 rounded-xl bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-sm">
                Browse Campaigns
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="text-sm font-semibold text-gray-900">Profile Completion</div>
              <div className="text-xs text-gray-500 mt-0.5">Complete your profile to receive more invitations.</div>
            </div>
            <div className="flex-1 w-full flex items-center gap-4">
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[78%]"></div>
              </div>
              <span className="text-sm font-bold text-emerald-600">78%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S SNAPSHOT */}
      <div>
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Today's Snapshot</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Profile Views" value="1,248" icon={Eye} trend={{ value: "12%", positive: true }} subtitle="vs last week" />
          <StatCard label="Pending Invites" value={pendingInvites} icon={Mail} trend={{ value: "2", positive: true }} subtitle="new today" />
          <StatCard label="Active Collabs" value={activeCollabs} icon={Handshake} />
          <StatCard label="Acceptance Rate" value="84%" icon={TrendingUp} trend={{ value: "4%", positive: true }} subtitle="vs last month" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 3. RECOMMENDED CAMPAIGNS */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recommended For You</h2>
              <Link to="/promoter/marketplace" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">View all <ArrowRight size={12}/></Link>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-1 px-1">
              {recommendedCampaigns.map(camp => (
                <div key={camp.id} className="min-w-[300px] w-[300px] bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-primary-200 transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">{camp.logo}</div>
                    <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
                      <Sparkles size={10} /> {camp.match}% Match
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{camp.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{camp.business}</p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1.5"><MapPin size={14}/> {camp.location}</span>
                      <span className="font-semibold text-gray-900">{formatNepaliCurrency(camp.budget)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 h-9 bg-primary-50 text-primary-700 rounded-lg text-sm font-semibold hover:bg-primary-100 transition-colors">Apply</button>
                      <button className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-gray-400 rounded-lg hover:text-primary-600 hover:bg-gray-50 transition-colors"><Bookmark size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. CREATOR ANALYTICS */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Performance</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 6. ACTIVE COLLABORATIONS */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Collaborations</h2>
              <Link to="/promoter/collaborations" className="text-xs font-semibold text-primary-600 hover:text-primary-700">View all</Link>
            </div>
            
            {collabsLoading ? (
               <div className="h-32 bg-gray-50 rounded-2xl animate-pulse"></div>
            ) : !collabs || collabs.items.length === 0 ? (
              <div className="bg-white border border-gray-100 border-dashed rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3"><Handshake size={20}/></div>
                <p className="text-sm font-medium text-gray-900">No active collaborations</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Apply to campaigns to start working with brands.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {collabs.items.slice(0,3).map((c: any) => (
                  <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-gray-200 flex items-center justify-between group hover:ring-primary-200 transition-all cursor-pointer" onClick={() => navigate('/promoter/collaborations')}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex flex-shrink-0 items-center justify-center font-bold">{c.campaign_title?.[0] || 'C'}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{c.campaign_title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.business_name} • Deadline: 12 Aug</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded">In Progress</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR COLUMN (4 cols) */}
        <div className="lg:col-span-4 space-y-8">

          {/* 4. PENDING INVITATIONS */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Mail size={16} className="text-amber-500"/> Pending Invitations
                {pendingInvites > 0 && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingInvites}</span>}
              </h2>
            </div>
            
            {invsLoading ? (
              <div className="space-y-3"><div className="h-16 bg-gray-50 rounded-xl animate-pulse"></div></div>
            ) : !invitations || invitations.items.filter((i:any) => i.status === 'PENDING').length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.items.filter((i:any) => i.status === 'PENDING').slice(0,3).map((inv:any) => (
                  <div key={inv.id} className="border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors">
                    <p className="text-sm font-bold text-gray-900 truncate">{inv.campaign_title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 mb-3">{formatNepaliCurrency(inv.campaign_budget)}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 h-8 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700">Accept</button>
                      <button className="flex-1 h-8 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-100">Decline</button>
                    </div>
                  </div>
                ))}
                <Link to="/promoter/invitations" className="block w-full text-center text-xs font-semibold text-gray-500 hover:text-primary-600 pt-2">View all invitations</Link>
              </div>
            )}
          </div>

          {/* 9. PROFILE INSIGHTS */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-sm ring-1 ring-indigo-100 p-5">
            <h2 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2"><Sparkles size={16} className="text-indigo-500"/> Profile Insights</h2>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-3 border border-indigo-50 flex items-start gap-3">
                <div className="mt-0.5"><Upload size={14} className="text-indigo-500"/></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Add 2 more portfolio items</p>
                  <p className="text-xs text-gray-500 mt-0.5">Creators with 3+ items get 40% more invites.</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-indigo-50 flex items-start gap-3">
                <div className="mt-0.5"><User size={14} className="text-indigo-500"/></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Write a better bio</p>
                  <p className="text-xs text-gray-500 mt-0.5">Keep it concise and highlight your exact niche.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 8. QUICK ACTIONS */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/promoter/marketplace" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                <Store size={18} className="mx-auto text-gray-600 mb-1.5"/>
                <span className="text-xs font-medium text-gray-700">Marketplace</span>
              </Link>
              <Link to="/promoter/profile" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                <User size={18} className="mx-auto text-gray-600 mb-1.5"/>
                <span className="text-xs font-medium text-gray-700">Edit Profile</span>
              </Link>
              <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                <Briefcase size={18} className="mx-auto text-gray-600 mb-1.5"/>
                <span className="text-xs font-medium text-gray-700">Portfolio</span>
              </button>
              <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                <Star size={18} className="mx-auto text-gray-600 mb-1.5"/>
                <span className="text-xs font-medium text-gray-700">Reviews</span>
              </button>
            </div>
          </div>

          {/* 10. RECENT ACTIVITY */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-5">Recent Activity</h2>
            <div className="space-y-4">
              {activities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full ${act.bg} ${act.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">{act.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
