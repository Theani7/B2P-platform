
import { formatDistanceToNow } from "date-fns";
import { 
  User, CheckCircle2, XCircle, FileEdit, PlusCircle, 
  Send, Briefcase, Star, Trash2, Zap
} from "lucide-react";
import { Avatar } from "./Avatar";
import type { ActivityLog } from "../../features/activity";

function getActionIcon(action: string) {
  switch (action) {
    case "created":
    case "registered":
      return <PlusCircle size={16} className="text-emerald-500" />;
    case "updated":
      return <FileEdit size={16} className="text-blue-500" />;
    case "deleted":
    case "withdrawn":
    case "cancelled":
      return <Trash2 size={16} className="text-red-500" />;
    case "accepted":
    case "verified":
      return <CheckCircle2 size={16} className="text-emerald-500" />;
    case "declined":
    case "rejected":
      return <XCircle size={16} className="text-red-500" />;
    case "submitted":
    case "sent":
      return <Send size={16} className="text-indigo-500" />;
    case "published":
      return <Zap size={16} className="text-amber-500" />;
    case "started":
    case "completed":
      return <Briefcase size={16} className="text-primary-500" />;
    case "reviewed":
      return <Star size={16} className="text-yellow-500" />;
    default:
      return <User size={16} className="text-gray-500" />;
  }
}

export function ActivityCard({ activity }: { activity: ActivityLog }) {
  const Icon = getActionIcon(activity.action);
  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });

  return (
    <div className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
      <div className="relative shrink-0">
        {activity.actor_avatar ? (
          <img src={activity.actor_avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
        ) : (
          <Avatar initials={activity.actor_name?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={activity.actor_id.charCodeAt(0) || 0} />
        )}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
          {Icon}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {activity.actor_name || "System"}
          </p>
          <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
        </div>
        <p className="text-sm font-semibold text-gray-900 mt-0.5">{activity.title}</p>
        {activity.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{activity.description}</p>
        )}
      </div>
    </div>
  );
}
