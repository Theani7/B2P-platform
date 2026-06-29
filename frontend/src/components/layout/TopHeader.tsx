import { Plus, User, ChevronDown, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { Link } from "react-router-dom";
import { NotificationBell } from "../notifications";
import { CommandPalette } from "../command-palette";
import { ShareProfileDialog } from "../sharing";
import { useState } from "react";
import { notifyError } from "../../hooks/useToast";
import { Role } from "../../constants/roles";
import { Badge } from "../ui";

export function TopHeader() {
  const { user, openLogoutDialog } = useAuth();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="h-16 px-6 border-b border-stone-100 bg-white flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1 max-w-lg flex items-center">
        <CommandPalette />
      </div>

      <div className="flex items-center gap-4 pl-4 ml-auto">
        {user?.role !== Role.ADMIN && (
          <button
            onClick={() => {
              if (!user?.has_profile) {
                notifyError("Please complete your profile to share it.");
                return;
              }
              setIsShareOpen(true);
            }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              !user?.has_profile 
                ? "text-stone-900 border-stone-100 bg-stone-50 cursor-not-allowed" 
                : "text-stone-900 hover:bg-stone-50 border-stone-100"
            }`}
          >
            Share Profile
          </button>
        )}
        {user?.role === Role.BUSINESS && (
          <button
            onClick={(e) => {
              if (!user?.has_profile) {
                e.preventDefault();
                notifyError("Please complete your profile to create a campaign.");
                return;
              }
              window.location.href = "/business/campaigns/create";
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !user?.has_profile
                ? "bg-stone-100 text-stone-900 cursor-not-allowed"
                : "bg-brand-indigo text-white hover:opacity-90"
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
            className="flex items-center gap-3 p-1 rounded-lg hover:bg-stone-50 transition-colors text-left"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-stone-900">{user?.full_name || "User"}</span>
              {user?.role && (
                <Badge variant={user.role === Role.BUSINESS ? "business" : "promoter"} className="scale-[0.85] origin-right">
                  {user.role === Role.BUSINESS ? "Business" : "Promoter"}
                </Badge>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-purple-50 text-brand-purple-900 flex items-center justify-center text-xs font-medium border border-purple-200">
              {user?.full_name?.charAt(0) || <User size={14} />}
            </div>
            <ChevronDown size={14} className="text-stone-900" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-stone-100 py-1 z-50">
              <div className="px-4 py-3 border-b border-stone-100 mb-1">
                <p className="text-sm font-medium text-stone-900 truncate">{user?.full_name || "User"}</p>
                <p className="text-xs text-stone-900 truncate">{user?.email}</p>
              </div>
              <Link
                to={user?.role === Role.BUSINESS ? "/business/profile" : "/promoter/profile"}
                className="flex items-center gap-3 px-4 py-2 text-sm text-stone-900 hover:bg-stone-50 transition-colors"
              >
                <Settings size={16} className="text-stone-900" />
                Settings
              </Link>
              <button
                onClick={() => openLogoutDialog()}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-brand-coral hover:bg-brand-coral-50 transition-colors text-left"
              >
                <LogOut size={16} className="text-brand-coral" />
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
