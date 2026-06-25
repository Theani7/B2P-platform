import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { usePromoterInvitations, usePromoterCollaborations } from "../features/collaboration/api";
import { usePromoterAnalytics } from "../features/analytics/api";

import { Avatar, StatCard } from "../components/ui";
import { formatNepaliCurrency } from "../utils/currency";

import {
  Briefcase,
  Handshake,
  Star,
  Upload,
  User,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Camera,
  Mail,
  Sparkles,
  Store
} from "lucide-react";

export default function PromoterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Real Data Hooks
  const { data: invitations, isLoading: invsLoading } = usePromoterInvitations({ limit: 5 });
  const { data: collabs, isLoading: collabsLoading } = usePromoterCollaborations({ limit: 5 });
  const { data: analytics } = usePromoterAnalytics();

  const pendingInvites = analytics?.summary?.invitations_pending ?? 0;
  const activeCollabs = analytics?.summary?.active_collaborations ?? 0;



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
                <p className="text-sm text-gray-500 mt-0.5">
                  ⭐ {analytics?.summary?.average_rating ?? "0.0"} ({analytics?.summary?.reviews_received ?? 0} reviews)
                </p>
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

        </div>
      </div>

      {/* 2. TODAY'S SNAPSHOT */}
      <div>
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Today's Snapshot</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <StatCard label="Pending Invites" value={pendingInvites} icon={Mail} />
          <StatCard label="Active Collabs" value={activeCollabs} icon={Handshake} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 7. CREATOR ANALYTICS */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 flex flex-col items-center justify-center text-center h-72">
            <BarChart3 size={32} className="text-gray-300 mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Profile Performance</h2>
            <p className="text-xs text-gray-500">Analytics are currently unavailable.</p>
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



        </div>
      </div>
    </div>
  );
}
