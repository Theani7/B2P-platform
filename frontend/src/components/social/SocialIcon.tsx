import React from "react";
import { Instagram, Youtube, Twitter, Facebook, Linkedin, Globe, Github, Dribbble, Link as LinkIcon } from "lucide-react";

export function SocialIcon({ platform, size = 20, className = "" }: { platform: string; size?: number; className?: string }) {
  const p = platform.toLowerCase();
  if (p === "instagram") return <Instagram size={size} className={className} />;
  if (p === "youtube") return <Youtube size={size} className={className} />;
  if (p === "twitter" || p === "x") return <Twitter size={size} className={className} />;
  if (p === "facebook") return <Facebook size={size} className={className} />;
  if (p === "linkedin") return <Linkedin size={size} className={className} />;
  if (p === "github") return <Github size={size} className={className} />;
  if (p === "dribbble") return <Dribbble size={size} className={className} />;
  if (p === "website") return <Globe size={size} className={className} />;
  return <LinkIcon size={size} className={className} />;
}
