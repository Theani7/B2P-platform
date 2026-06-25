import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { usePromoterApplications } from "../features/collaboration/api";
import { usePromoterInvitations } from "../features/collaboration/api";
import { usePromoterCollaborations } from "../features/collaboration/api";
import {
  FileText,
  Mail,
  Handshake,
  ArrowRight,
  Store,
  Star,
  Sparkles,
} from "lucide-react";

export default function PromoterDashboard() {
  const { user } = useAuth();
  const { data: applications } = usePromoterApplications({ limit: 1 });
  const { data: invitations } = usePromoterInvitations({ limit: 1 });
  const { data: collabs } = usePromoterCollaborations({ limit: 1 });

  const activeApps = applications?.total ?? 0;
  const pendingInvites = invitations?.total ?? 0;
  const activeCollabs = collabs?.total ?? 0;

  const quickLinks = [
    {
      to: "/promoter/marketplace",
      label: "Campaign Marketplace",
      desc: "Discover and apply to brand campaigns",
      icon: Store,
      color: "purple",
    },
    {
      to: "/promoter/applications",
      label: "My Applications",
      desc: "Track your campaign applications",
      icon: FileText,
      color: "teal",
    },
    {
      to: "/promoter/invitations",
      label: "Invitations",
      desc: "Review collaboration invitations",
      icon: Mail,
      color: "amber",
    },
    {
      to: "/promoter/collaborations",
      label: "Active Collaborations",
      desc: "View active and past partnerships",
      icon: Handshake,
      color: "indigo",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      {/* Hero */}
      <div className="rounded-2xl bg-brand-teal p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <Sparkles size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-white">
              Welcome, {user?.full_name ?? "Promoter"}
            </h1>
            <p className="text-sm text-white/70 mt-0.5">Discover brands and grow your partnerships</p>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          const colorClasses: Record<string, string> = {
            purple: "bg-brand-purple-50 text-brand-purple ring-brand-purple/10 hover:border-brand-purple/20",
            teal: "bg-brand-teal-50 text-brand-teal ring-brand-teal/10 hover:border-brand-teal/20",
            amber: "bg-brand-amber-50 text-brand-amber ring-brand-amber/10 hover:border-brand-amber/20",
            indigo: "bg-brand-indigo-50 text-brand-indigo ring-brand-indigo/10 hover:border-brand-indigo/20",
          };
          return (
            <Link
              key={link.to}
              to={link.to}
              className="group bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl ${colorClasses[link.color]} flex items-center justify-center ring-1 mb-4`}>
                <Icon size={22} />
              </div>
              <h2 className="text-base font-medium text-gray-900 group-hover:text-brand-purple transition-colors">{link.label}</h2>
              <p className="text-sm text-gray-400 mt-1">{link.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity">
                Get started <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple-50 flex items-center justify-center ring-1 ring-brand-purple/10 text-brand-purple">
              <Store size={18} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">{activeApps}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Active Applications</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal-50 flex items-center justify-center ring-1 ring-brand-teal/10 text-brand-teal">
              <Handshake size={18} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">{activeCollabs}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Active Collabs</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-amber-50 flex items-center justify-center ring-1 ring-brand-amber/10 text-brand-amber">
              <Star size={18} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">{pendingInvites}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Pending Invitations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
