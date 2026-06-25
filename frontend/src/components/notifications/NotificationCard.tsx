import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, MessageSquare, Briefcase, Star, CheckCircle, XCircle } from "lucide-react";
import type { Notification } from "../../features/notifications";
import { Link } from "react-router-dom";
import { useMarkNotificationRead } from "../../features/notifications";

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const markRead = useMarkNotificationRead();

  const getIcon = () => {
    switch (notification.type) {
      case "NEW_MESSAGE": return <MessageSquare size={18} className="text-blue-500" />;
      case "APPLICATION_RECEIVED":
      case "COLLABORATION_STARTED": return <Briefcase size={18} className="text-primary-500" />;
      case "APPLICATION_ACCEPTED":
      case "INVITATION_ACCEPTED": return <CheckCircle size={18} className="text-emerald-500" />;
      case "APPLICATION_REJECTED":
      case "INVITATION_DECLINED": return <XCircle size={18} className="text-red-500" />;
      case "REVIEW_RECEIVED": return <Star size={18} className="text-yellow-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

  const getLink = () => {
    switch (notification.type) {
      case "NEW_MESSAGE": return "/messages";
      case "REVIEW_RECEIVED": return "/my/reviews";
      case "APPLICATION_RECEIVED": return "/business/campaigns";
      case "COLLABORATION_STARTED": return "/business/collaborations"; // or promoter
      default: return "#";
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }
    if (onClick) onClick();
  };

  return (
    <Link 
      to={getLink()} 
      onClick={handleClick}
      className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${!notification.is_read ? 'bg-primary-50/30' : ''}`}
    >
      <div className="mt-1 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm ${!notification.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
          {notification.title}
        </h4>
        <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{notification.message}</p>
        <span className="text-xs text-gray-400 mt-1 block">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </span>
      </div>
      {!notification.is_read && (
        <div className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-2 shrink-0"></div>
      )}
    </Link>
  );
}
