"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  LayoutDashboard,
  Target,
  Layers,
  MessageSquare,
  Bell,
  Star,
  Briefcase,
  User,
  Settings,
  LogOut,
  Shield,
  Plus,
  History,
  Clock,
  Globe,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useRecentPages, useRecentCommands, Command, CommandType } from "@/features/command-palette";
import { Role } from "@/lib/roles";

const ICON_MAP: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={16} />,
  campaigns: <Target size={16} />,
  applications: <Layers size={16} />,
  collaborations: <Layers size={16} />,
  messages: <MessageSquare size={16} />,
  notifications: <Bell size={16} />,
  reviews: <Star size={16} />,
  portfolio: <Briefcase size={16} />,
  profile: <User size={16} />,
  settings: <Settings size={16} />,
  logout: <LogOut size={16} />,
  admin: <Shield size={16} />,
  plus: <Plus size={16} />,
  globe: <Globe size={16} />,
  clock: <Clock size={16} />,
};

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  const { recentPages } = useRecentPages();
  const { recentCommands, addRecentCommand, clearRecentCommands } = useRecentCommands();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpenRef.current) {
          handleClose();
        } else {
          setIsOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      );
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setActiveIndex(0);
      return () => cancelAnimationFrame(id);
    } else {
      document.body.style.overflow = "";
      setVisible(false);
    }
  }, [isOpen]);

  const staticCommands = useMemo<Command[]>(() => {
    if (!user) return [];

    const cmds: Command[] = [];
    const prefix = user.role === Role.BUSINESS ? "/business" : user.role === Role.PROMOTER ? "/promoter" : "/admin";

    cmds.push({ id: "nav-dashboard", title: "Dashboard", type: "navigation", icon: "dashboard", action: () => router.push(`${prefix}/dashboard`) });

    if (user.role === Role.ADMIN) {
      cmds.push({ id: "nav-users", title: "Users Management", type: "navigation", icon: "profile", action: () => router.push("/admin/users") });
      cmds.push({ id: "nav-verification", title: "Verification Requests", type: "navigation", icon: "shield", action: () => router.push("/admin/verification") });
      cmds.push({ id: "nav-campaigns", title: "Campaign Moderation", type: "navigation", icon: "campaigns", action: () => router.push("/admin/campaigns") });
      cmds.push({ id: "nav-reviews", title: "Review Moderation", type: "navigation", icon: "reviews", action: () => router.push("/admin/reviews") });
      cmds.push({ id: "nav-settings", title: "Platform Settings", type: "navigation", icon: "settings", action: () => router.push("/admin/settings") });
    } else if (user.role === Role.BUSINESS) {
      cmds.push({ id: "nav-campaigns", title: "Campaigns", type: "navigation", icon: "campaigns", action: () => router.push("/business/campaigns") });
      cmds.push({ id: "nav-applications", title: "Applications", type: "navigation", icon: "applications", action: () => router.push("/business/applications") });
      cmds.push({ id: "action-marketplace", title: "Promoters", type: "navigation", icon: "globe", action: () => router.push("/business/promoters") });
      cmds.push({ id: "nav-saved", title: "Saved Promoters", type: "navigation", icon: "portfolio", action: () => router.push("/business/promoters?tab=saved") });
      cmds.push({ id: "nav-collaborations", title: "Collaborations", type: "navigation", icon: "collaborations", action: () => router.push("/business/collaborations") });
      cmds.push({ id: "nav-invitations", title: "Invitations", type: "navigation", icon: "applications", action: () => router.push("/business/invitations") });
      cmds.push({ id: "nav-reviews", title: "Reviews", type: "navigation", icon: "reviews", action: () => router.push("/business/reviews") });
      cmds.push({ id: "nav-messages", title: "Messages", type: "navigation", icon: "messages", action: () => router.push("/messages") });
      cmds.push({ id: "nav-notifications", title: "Notifications", type: "navigation", icon: "notifications", action: () => router.push("/notifications") });
      cmds.push({ id: "nav-profile", title: "Business Profile", type: "navigation", icon: "profile", action: () => router.push("/business/profile") });
      cmds.push({ id: "nav-settings", title: "Settings", type: "navigation", icon: "settings", action: () => router.push("/settings/account") });
    } else if (user.role === Role.PROMOTER) {
      cmds.push({ id: "nav-marketplace", title: "Marketplace", type: "navigation", icon: "globe", action: () => router.push("/promoter/marketplace") });
      cmds.push({ id: "nav-opportunities", title: "Opportunities", type: "navigation", icon: "applications", action: () => router.push("/promoter/opportunities") });
      cmds.push({ id: "nav-collaborations", title: "Collaborations", type: "navigation", icon: "collaborations", action: () => router.push("/promoter/collaborations") });
      cmds.push({ id: "nav-reviews", title: "My Reviews", type: "navigation", icon: "reviews", action: () => router.push("/promoter/reviews") });
      cmds.push({ id: "nav-messages", title: "Messages", type: "navigation", icon: "messages", action: () => router.push("/messages") });
      cmds.push({ id: "nav-notifications", title: "Notifications", type: "navigation", icon: "notifications", action: () => router.push("/notifications") });
      cmds.push({ id: "nav-profile", title: "Promoter Profile", type: "navigation", icon: "profile", action: () => router.push("/promoter/profile") });
      cmds.push({ id: "nav-settings", title: "Settings", type: "navigation", icon: "settings", action: () => router.push("/settings/account") });
    }

    if (user.role === Role.ADMIN) {
      cmds.push({ id: "nav-export", title: "Export", type: "navigation", icon: "campaigns", action: () => router.push("/export") });
    }
    cmds.push({ id: "action-logout", title: "Logout", type: "action", icon: "logout", action: () => logout() });

    return cmds;
  }, [user, router, logout]);

  const filteredCommands = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return staticCommands.filter(
      (c) => c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.keywords && c.keywords.some((kw) => kw.includes(q))),
    );
  }, [query, staticCommands]);

  const activeItems = useMemo<Command[]>(() => {
    if (query.trim().length >= 2) {
      return [...filteredCommands];
    }
    const recents: Command[] = recentPages.map((rp) => ({
      id: `recent-page-${rp.path}`,
      title: rp.title,
      subtitle: rp.path,
      type: "recent_page",
      icon: "clock",
      action: () => router.push(rp.path),
    }));

    const recentCmds = recentCommands
      .map((id) => staticCommands.find((c) => c.id === id))
      .filter(Boolean) as Command[];

    return [
      ...recentCmds,
      ...recents,
      ...staticCommands.filter((c) => c.type === "action"),
      ...staticCommands.filter((c) => c.type === "navigation"),
    ];
  }, [query, filteredCommands, recentPages, recentCommands, staticCommands, router]);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeItems.length, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % activeItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeItems[activeIndex]) executeCommand(activeItems[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  const executeCommand = (cmd: Command) => {
    addRecentCommand(cmd.id);
    handleClose();
    cmd.action();
  };

  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Search or command palette"
        className="group flex items-center gap-2.5 h-9 px-3.5 bg-linen-canvas hover:bg-white border border-steel/15 hover:border-signal-blue/30 rounded-pill cursor-pointer transition-all shadow-sm hover:shadow-md w-full sm:w-80 md:w-96"
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <Search size={15} className="text-ash group-hover:text-signal-blue transition-colors flex-shrink-0" />
        <span className="text-xs font-medium text-ash group-hover:text-graphite transition-colors flex-1 text-left truncate">
          Search or type a command...
        </span>
        <div className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-steel/20 bg-white/80 group-hover:bg-white text-[10px] font-mono font-semibold text-ash group-hover:text-graphite shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <span className="text-[10px]">⌘</span>K
        </div>
      </div>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4 pb-4">
          <div
            className={`fixed inset-0 bg-midnight-ink/50 backdrop-blur-sm transition-opacity duration-200 ease-out ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
            aria-hidden="true"
          />

          <div className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-steel/15 overflow-hidden flex flex-col max-h-[80vh] transition-all duration-200 ease-out ${
            visible ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2 scale-[0.98] opacity-0"
          }`}>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-steel/10 bg-linen-canvas/30">
              <Search size={18} className="text-signal-blue flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you need? (e.g. campaigns, promoters, settings...)"
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-ash text-graphite font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md bg-steel/10 hover:bg-steel/20 text-graphite text-xs font-semibold px-2 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-2 min-h-[300px]">
              {activeItems.length === 0 ? (
                <div className="py-12 text-center text-ash">
                  <p>No results found for &quot;{query}&quot;</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {activeItems.map((cmd, idx) => (
                    <div
                      key={cmd.id + idx}
                      data-active={idx === activeIndex}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                        idx === activeIndex ? "bg-sky-wash/80 border border-signal-blue/20 text-signal-blue shadow-sm" : "hover:bg-sky-wash/40 border border-transparent"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border ${
                          idx === activeIndex ? "text-signal-blue border-signal-blue/30" : "text-ash border-steel/15"
                        }`}
                      >
                        {cmd.icon ? ICON_MAP[cmd.icon] || <Search size={16} /> : <Search size={16} />}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className={`text-xs font-semibold truncate ${idx === activeIndex ? "text-signal-blue" : "text-graphite"}`}>
                          {cmd.title}
                        </span>
                        {cmd.subtitle && <span className="text-[11px] text-ash truncate mt-0.5">{cmd.subtitle}</span>}
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        <span className="text-[10px] text-ash uppercase tracking-wider font-mono font-semibold px-2 py-0.5 rounded bg-steel/10">
                          {(cmd.type as CommandType).replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 bg-linen-canvas/60 border-t border-steel/10 text-[11px] text-ash flex justify-between items-center">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white border border-steel/20 rounded px-1.5 py-0.5 font-mono text-[10px] shadow-sm">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white border border-steel/20 rounded px-1.5 py-0.5 font-mono text-[10px] shadow-sm">↵</kbd> select
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white border border-steel/20 rounded px-1.5 py-0.5 font-mono text-[10px] shadow-sm">esc</kbd> close
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-fog font-mono text-[10px]">B2P Command</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
