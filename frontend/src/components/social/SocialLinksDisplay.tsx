import React from "react";
import { CheckCircle2 } from "lucide-react";
import { SocialIcon } from "./SocialIcon";
import { useUserSocialLinks } from "../../features/social";

interface SocialLinksDisplayProps {
  userId: string;
}

export function SocialLinksDisplay({ userId }: SocialLinksDisplayProps) {
  const { data: links, isLoading } = useUserSocialLinks(userId);

  if (isLoading || !links || links.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {links.map((link) => (
        <a 
          key={link.id} 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 border border-gray-200 px-3 py-1.5 rounded-full transition-colors"
          title={`${link.platform}: ${link.username}`}
        >
          <div className={`flex items-center justify-center text-white w-5 h-5 rounded-full text-xs shadow-sm
            ${link.platform.toLowerCase() === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' :
              link.platform.toLowerCase() === 'youtube' ? 'bg-red-500' :
              link.platform.toLowerCase() === 'twitter' || link.platform.toLowerCase() === 'x' ? 'bg-black' :
              link.platform.toLowerCase() === 'linkedin' ? 'bg-blue-600' :
              link.platform.toLowerCase() === 'facebook' ? 'bg-blue-500' :
              'bg-gray-800'
            }
          `}>
            <SocialIcon platform={link.platform} size={10} />
          </div>
          <span className="text-sm font-medium text-gray-700">{link.username}</span>
          {link.is_verified && <CheckCircle2 size={12} className="text-emerald-500 ml-0.5" />}
        </a>
      ))}
    </div>
  );
}
