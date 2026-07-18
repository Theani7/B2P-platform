import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, BadgeCheck, MapPin, Briefcase, Star, Users, TrendingUp, 
  Bookmark, Share2, Play, Image as ImageIcon, ExternalLink, Mail, Send
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import InvitePromoterModal from "./InvitePromoterModal";
import { notifySuccess, notifyError } from "@/lib/notify";
import { usePublicPromoterProfile } from "@/features/discovery/api";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoter: any;
  onSave: (id: string) => void;
  isSaved?: boolean;
}

export function formatCompactNumber(number: number) {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number || 0);
}

export function ProfilePreviewModal({ isOpen, onClose, promoter, onSave, isSaved }: ProfilePreviewModalProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const { data: fullProfile, isLoading } = usePublicPromoterProfile(isOpen && promoter ? promoter.username : "");

  if (!isOpen || !promoter || !mounted) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    notifySuccess("Profile URL copied to clipboard!");
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[1000px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col z-[101] overflow-hidden"
          >
            <div className="relative p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  {promoter.avatarUrl ? (
                    <img src={promoter.avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-50" />
                  ) : (
                    <Avatar initials={promoter.username?.[0]?.toUpperCase() ?? "?"} size="lg" colorIndex={promoter.id?.charCodeAt(0) || 0} />
                  )}
                  {promoter.verified && (
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-signal-blue flex items-center justify-center ring-4 ring-white shadow-sm">
                      <BadgeCheck size={16} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{promoter.username}</h2>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-tag/10 text-amber-tag text-xs font-bold tracking-wide">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {promoter.averageRating ? promoter.averageRating.toFixed(1) : "0.0"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1.5">{promoter.headline || "No headline provided"}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <MapPin size={12} className="text-gray-500" /> {promoter.location || "Remote"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-wash text-signal-blue">
                      <Briefcase size={12} className="text-signal-blue" /> {promoter.niche || "General"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleShare}
                  className="hidden sm:flex h-10 items-center justify-center gap-2 px-4 rounded-xl text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors"
                >
                  <Share2 size={16} />
                  <span className="hidden md:inline">Share</span>
                </button>
                <button
                  onClick={() => onSave(promoter.id)}
                  className={`h-10 px-4 rounded-xl border font-medium text-sm transition-colors shadow-sm ${isSaved ? 'bg-sky-wash border-signal-blue text-signal-blue hover:bg-sky-wash/80 hover:text-signal-blue' : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <Bookmark size={16} className={`inline mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="h-10 px-5 rounded-xl bg-signal-blue text-white font-medium text-sm hover:opacity-90 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Send size={16} />
                  Invite to Campaign
                </button>
                <button onClick={onClose} className="p-2 ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-linen-canvas/50 p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                <div className="lg:col-span-5 space-y-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-gray-50 rounded-lg"><Users size={16} className="text-gray-500" /></div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Followers</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{formatCompactNumber(promoter.followersCount || promoter.followers_count)}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp size={16} className="text-emerald-500" /></div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{(promoter.engagementRate || promoter.engagement_rate || 0).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">About Creator</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {fullProfile?.bio || promoter.bio || "This promoter hasn't added a bio yet. They mainly focus on creating high-quality content for their audience."}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Social Channels</h3>
                    <div className="space-y-3">
                      {isLoading ? (
                        <div className="animate-pulse h-12 bg-gray-100 rounded-xl"></div>
                      ) : fullProfile?.socialLinks?.length ? (
                        fullProfile.socialLinks.map((link: any, idx: number) => (
                          <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-signal-blue/20 hover:bg-sky-wash transition-colors group">
                            <div className="flex items-center gap-3">
                              <ExternalLink size={18} className="text-gray-400 group-hover:text-signal-blue" />
                              <span className="text-sm font-medium text-gray-700 group-hover:text-signal-blue capitalize">{link.platform}</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">View Profile</span>
                          </a>
                        ))
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-sm">
                          <Mail size={16} />
                          Contact directly for platforms
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Portfolio Work</h3>
                  </div>
                  
                  {isLoading ? (
                    <div className="grid grid-cols-2 gap-4 animate-pulse">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[4/5] rounded-xl bg-gray-100"></div>
                      ))}
                    </div>
                  ) : fullProfile?.portfolioItems?.length ? (
                    <PortfolioGrid items={fullProfile.portfolioItems} isOwner={false} />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 rounded-xl">
                      <ImageIcon size={32} className="text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No portfolio items added yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {isInviteModalOpen && (
        <InvitePromoterModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          promoter={promoter}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}
