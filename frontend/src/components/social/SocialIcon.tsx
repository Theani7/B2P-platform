import React from "react";
import { Camera, Video, MessageCircle, Users, Briefcase, Globe, Code, Palette, Link as LinkIcon } from "lucide-react";

export function SocialIcon({ platform, size = 20, className = "" }: { platform: string; size?: number; className?: string }) {
  const p = platform.toLowerCase();
  if (p === "instagram") return <Camera size={size} className={className} />;
  if (p === "youtube") return <Video size={size} className={className} />;
  if (p === "twitter" || p === "x") return <MessageCircle size={size} className={className} />;
  if (p === "facebook") return <Users size={size} className={className} />;
  if (p === "linkedin") return <Briefcase size={size} className={className} />;
  if (p === "github") return <Code size={size} className={className} />;
  if (p === "dribbble") return <Palette size={size} className={className} />;
  if (p === "website") return <Globe size={size} className={className} />;
  return <LinkIcon size={size} className={className} />;
}
