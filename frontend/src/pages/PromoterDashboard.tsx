import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-teal via-brand-teal-900 to-brand-purple-900 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shadow-lg ring-1 ring-white/20">
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
      </div>

      {/* Quick Links Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          const colorClasses: Record<string, string> = {
            purple: "from-brand-purple-50 to-brand-indigo-50 text-brand-purple ring-brand-purple/10 hover:border-brand-purple/20",
            teal: "from-brand-teal-50 to-brand-teal-50/50 text-brand-teal ring-brand-teal/10 hover:border-brand-teal/20",
            amber: "from-brand-amber-50 to-brand-amber-50/50 text-brand-amber ring-brand-amber/10 hover:border-brand-amber/20",
            indigo: "from-brand-indigo-50 to-brand-indigo-50/50 text-brand-indigo ring-brand-indigo/10 hover:border-brand-indigo/20",
          };
          return (
            <Link
              key={link.to}
              to={link.to}
              className="group bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[link.color]} flex items-center justify-center ring-1 mb-4`}>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple-50 to-brand-indigo-50 flex items-center justify-center ring-1 ring-brand-purple/10 text-brand-purple">
              <Store size={18} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">--</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Active Applications</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal-50 to-brand-teal-50/50 flex items-center justify-center ring-1 ring-brand-teal/10 text-brand-teal">
              <Handshake size={18} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">--</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Active Collabs</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-amber-50 to-brand-amber-50/50 flex items-center justify-center ring-1 ring-brand-amber/10 text-brand-amber">
              <Star size={18} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">--</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Reviews Received</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
