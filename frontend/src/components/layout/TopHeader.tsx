import { Bell, Search, Plus, User } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { Link } from "react-router-dom";

export function TopHeader() {
  const { user } = useAuth();

  return (
    <header className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 max-w-lg flex items-center">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns, promoters..."
            className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pl-4 ml-auto">
        <Link
          to="/business/campaigns/create"
          className="hidden sm:flex items-center gap-1.5 bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Campaign
        </Link>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium border border-primary-200">
          {user?.full_name?.charAt(0) || <User size={14} />}
        </div>
      </div>
    </header>
  );
}
