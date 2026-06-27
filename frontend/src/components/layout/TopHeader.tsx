import { Plus, User } from "lucide-react";
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
  const { user } = useAuth();
  const [isShareOpen, setIsShareOpen] = useState(false);

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
        <div className="flex items-center gap-3">
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
        </div>
      </div>
      <ShareProfileDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </header>
  );
}
