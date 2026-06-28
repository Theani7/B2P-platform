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
    <header className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1 max-w-lg flex items-center">
        <CommandPalette />
      </div>

      <div className="flex items-center gap-4 pl-4 ml-auto">
        <button
          onClick={() => {
            if (!user?.has_profile) {
              notifyError("Please complete your profile to share it.");
              return;
            }
            setIsShareOpen(true);
          }}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
            !user?.has_profile 
              ? "text-gray-400 border-gray-100 bg-gray-50 cursor-not-allowed" 
              : "text-gray-700 hover:bg-gray-100 border-gray-200"
          }`}
        >
          Share Profile
        </button>
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
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm ${
              !user?.has_profile
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-primary-600 text-white hover:bg-primary-700"
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
            className="flex items-center gap-3 p-1 rounded-md hover:bg-gray-50 transition-colors text-left"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-gray-900">{user?.full_name || "User"}</span>
              {user?.role && (
                <Badge variant={user.role === Role.BUSINESS ? "business" : "promoter"} className="scale-[0.85] origin-right">
                  {user.role === Role.BUSINESS ? "Business" : "Promoter"}
                </Badge>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium border border-primary-200">
              {user?.full_name?.charAt(0) || <User size={14} />}
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link
                to={user?.role === Role.BUSINESS ? "/business/profile" : "/promoter/profile"}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings size={16} className="text-gray-400" />
                Settings
              </Link>
              <button
                onClick={() => openLogoutDialog()}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={16} className="text-red-400" />
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
