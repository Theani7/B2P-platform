"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ShareProfileDialog } from "@/components/sharing/ShareProfileDialog";
import { Role, RoleLabels } from "@/lib/roles";
import { notifyError } from "@/lib/notify";
import {
  ShareNetwork,
  Plus,
  User,
  Gear,
  SignOut,
  CaretDown,
} from "@phosphor-icons/react";

export function TopHeader() {
  const router = useRouter();
  const { user, openLogoutDialog, hasProfile } = useAuth();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  const avatarSrc = user?.promoterProfile?.avatarUrl || user?.businessProfile?.logoUrl || null;

  return (
    <header className="h-16 px-6 border-b border-steel/10 bg-white/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-[200]">
      {/* Command Palette / Global Search */}
      <div className="flex-1 max-w-lg flex items-center">
        <CommandPalette />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 pl-4 ml-auto">
        {/* Share Profile Button (Promoters and Businesses) */}
        {user?.role !== Role.ADMIN && (
          <button
            onClick={() => {
              if (!hasProfile) {
                notifyError("Please complete your profile to share it.");
                return;
              }
              setIsShareOpen(true);
            }}
            className={`hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-pill border text-xs font-semibold shadow-sm transition-all ${
              !hasProfile
                ? "text-fog border-steel/15 bg-linen-canvas cursor-not-allowed opacity-60"
                : "text-graphite border-steel/15 bg-white hover:bg-sky-wash hover:border-signal-blue/30 hover:text-signal-blue"
            }`}
          >
            <ShareNetwork size={15} weight="bold" className="text-signal-blue flex-shrink-0" />
            <span>Share Profile</span>
          </button>
        )}

        {/* Create Campaign Shortcut (Business Only) */}
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
            className={`hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-pill text-xs font-semibold shadow-product-card hover:shadow-elevated transition-all ${
              !hasProfile
                ? "bg-steel/10 text-steel cursor-not-allowed"
                : "bg-signal-blue hover:bg-signal-blue/90 text-white"
            }`}
          >
            <Plus size={15} weight="bold" className="flex-shrink-0" />
            <span>Create Campaign</span>
          </button>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            onBlur={() => setTimeout(() => setIsProfileMenuOpen(false), 200)}
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-pill border border-steel/15 bg-white hover:border-signal-blue/30 hover:bg-sky-wash/50 transition-all text-left shadow-sm group"
          >
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-sky-wash text-xs font-bold text-signal-blue border border-signal-blue/20 flex-shrink-0">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-xs font-semibold text-graphite group-hover:text-signal-blue transition-colors max-w-[110px] truncate leading-tight">
                {user?.fullName || "User"}
              </span>
              <span className="text-[10px] font-medium font-mono text-ash uppercase tracking-wider leading-none mt-0.5">
                {RoleLabels[user?.role as Role] ?? user?.role}
              </span>
            </div>

            <CaretDown size={12} weight="bold" className="text-fog group-hover:text-signal-blue transition-colors flex-shrink-0" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-steel/15 py-1.5 z-50 shadow-xl overflow-hidden divide-y divide-steel/10 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-3 bg-linen-canvas/50">
                <p className="text-xs font-bold text-graphite truncate">{user?.fullName || "User"}</p>
                <p className="text-[11px] text-ash truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="py-1">
                {user?.role !== Role.ADMIN && (
                  <Link
                    href={user?.role === Role.BUSINESS ? "/business/profile" : "/promoter/profile"}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-graphite hover:bg-sky-wash transition-colors"
                  >
                    <User size={15} weight="bold" className="text-ash" />
                    <span>Edit Profile</span>
                  </Link>
                )}
                <Link
                  href={user?.role === Role.ADMIN ? "/admin/settings" : "/settings/account"}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-graphite hover:bg-sky-wash transition-colors"
                >
                  <Gear size={15} weight="bold" className="text-ash" />
                  <span>Account Settings</span>
                </Link>
              </div>

              <div className="py-1">
                <button
                  onClick={() => openLogoutDialog()}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-coral-alert hover:bg-coral-alert/10 transition-colors text-left"
                >
                  <SignOut size={15} weight="bold" className="text-coral-alert" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ShareProfileDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </header>
  );
}
