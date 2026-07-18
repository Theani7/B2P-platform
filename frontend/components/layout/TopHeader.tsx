"use client";

import { Plus, User, ChevronDown, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ShareProfileDialog } from "@/components/sharing/ShareProfileDialog";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Role } from "@/lib/roles";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notifyError } from "@/lib/notify";

export function TopHeader() {
  const router = useRouter();
  const { user, openLogoutDialog, hasProfile } = useAuth();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const initials =
    user?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";
  const colorIndex = user?.id ? Math.floor(parseInt(user.id) % 5) : 0;

  return (
    <header className="h-16 px-6 border-b border-slate-custom/10 bg-white/70 backdrop-blur-lg flex items-center justify-between sticky top-0 z-[200]">
      <div className="flex-1 max-w-lg flex items-center">
        <CommandPalette />
      </div>

      <div className="flex items-center gap-4 pl-4 ml-auto">
        {user?.role !== Role.ADMIN && (
          <button
            onClick={() => {
              if (!hasProfile) {
                notifyError("Please complete your profile to share it.");
                return;
              }
              setIsShareOpen(true);
            }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-button text-sm font-medium transition-colors border ${
              !hasProfile
                ? "text-graphite border-slate-custom/10 bg-linen-canvas cursor-not-allowed"
                : "text-graphite hover:bg-sky-wash border-slate-custom/10"
            }`}
          >
            Share Profile
          </button>
        )}
        {user?.role === Role.BUSINESS && (
          <button
            onClick={(e) => {
              if (!hasProfile) {
                e.preventDefault();
                notifyError("Please complete your profile to create a campaign.");
                return;
              }
              router.push("/business/campaigns/create");
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-button text-sm font-medium transition-colors ${
              !hasProfile
                ? "bg-slate-custom/10 text-steel cursor-not-allowed"
                : "hero-blue-fade text-white hover:opacity-90"
            }`}
          >
            <Plus size={16} />
            Create Campaign
          </button>
        )}
        <NotificationBell />
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            onBlur={() => setTimeout(() => setIsProfileMenuOpen(false), 200)}
            className="flex items-center gap-3 p-1 rounded-button hover:bg-sky-wash transition-colors text-left"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-graphite">{user?.fullName || "User"}</span>
              {user?.role && (
                <Badge variant={user.role === Role.BUSINESS ? "business" : "promoter"} className="scale-[0.85] origin-right">
                  {user.role === Role.BUSINESS ? "Business" : "Promoter"}
                </Badge>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-sky-wash text-signal-blue flex items-center justify-center text-xs font-medium border border-slate-custom/10">
              {initials}
            </div>
            <ChevronDown size={14} className="text-graphite" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-cards border border-slate-custom/10 py-1 z-50 shadow-product-card">
              <div className="px-4 py-3 border-b border-slate-custom/10 mb-1">
                <p className="text-sm font-medium text-graphite truncate">{user?.fullName || "User"}</p>
                <p className="text-sm text-steel truncate">{user?.email}</p>
              </div>
              <Link
                href={user?.role === Role.BUSINESS ? "/business/profile" : "/promoter/profile"}
                className="flex items-center gap-3 px-4 py-2 text-sm text-graphite hover:bg-sky-wash transition-colors"
              >
                <Settings size={16} className="text-graphite" />
                Settings
              </Link>
              <button
                onClick={() => openLogoutDialog()}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-coral-alert hover:bg-coral-alert/10 transition-colors text-left"
              >
                <LogOut size={16} className="text-coral-alert" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
      <ShareProfileDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </header>
  );
}
