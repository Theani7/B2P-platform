import { Bell, Search, Plus, User } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { Link } from "react-router-dom";
import { NotificationBell } from "../notifications";
import { CommandPalette } from "../command-palette";
import { ShareProfileDialog } from "../sharing";
import { useState } from "react";

export function TopHeader() {
  const { user } = useAuth();
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <header className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 max-w-lg flex items-center">
        <CommandPalette />
      </div>

      <div className="flex items-center gap-4 pl-4 ml-auto">
        <button
          onClick={() => setIsShareOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
        >
          Share Profile
        </button>
        <Link
          to="/business/campaigns/create"
          className="hidden sm:flex items-center gap-1.5 bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Campaign
        </Link>
        <NotificationBell />
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium border border-primary-200">
          {user?.full_name?.charAt(0) || <User size={14} />}
        </div>
      </div>
      <ShareProfileDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </header>
  );
}
