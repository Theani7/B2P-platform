import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, BadgeCheck, MapPin, Briefcase, Star, Users, TrendingUp, 
  Bookmark, Share2, Play, Image as ImageIcon, ExternalLink, Mail, Send
} from "lucide-react";
import { Avatar } from "../ui";
import InvitePromoterModal from "./InvitePromoterModal";
import { notifySuccess } from "../../hooks/useToast";

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoter: any;
  onSave: (id: string) => void;
  isSaved?: boolean;
}

export default function ProfilePreviewModal({ isOpen, onClose, promoter, onSave, isSaved }: ProfilePreviewModalProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !promoter) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    notifySuccess("Profile URL copied to clipboard!");
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
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
                  {promoter.avatar_url ? (
                    <img src={promoter.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-50" />
                  ) : (
                    <Avatar initials={promoter.username?.[0]?.toUpperCase() ?? "?"} size="lg" colorIndex={promoter.id?.charCodeAt(0) || 0} />
                  )}
                  {promoter.verified && (
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center ring-4 ring-white shadow-sm">
                      <BadgeCheck size={16} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{promoter.username}</h2>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold tracking-wide">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      4.9
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1.5">{promoter.headline || "No headline provided"}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <MapPin size={12} className="text-gray-500" /> {promoter.location || "Remote"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                      <Briefcase size={12} className="text-primary-500" /> {promoter.niche || "General"}
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
                  className={`h-10 px-4 rounded-xl border font-medium text-sm transition-colors shadow-sm ${isSaved ? 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100 hover:text-primary-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <Bookmark size={16} className={`inline mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="h-10 px-5 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Send size={16} />
                  Invite to Campaign
                </button>
                <button onClick={onClose} className="p-2 ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                <div className="lg:col-span-5 space-y-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-gray-50 rounded-lg"><Users size={16} className="text-gray-500" /></div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Followers</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{(promoter.followers_count || 0).toLocaleString()}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp size={16} className="text-emerald-500" /></div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{(promoter.engagement_rate || 0).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">About Creator</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {promoter.bio || "This promoter hasn't added a bio yet. They mainly focus on creating high-quality content for their audience."}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Social Channels</h3>
                    <div className="space-y-3">
                      {promoter.social_links?.length > 0 ? (
                        promoter.social_links.map((link: any, idx: number) => (
                          <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors group">
                            <div className="flex items-center gap-3">
                              <ExternalLink size={18} className="text-gray-400 group-hover:text-primary-500" />
                              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 capitalize">{link.platform}</span>
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-[4/5] rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100 overflow-hidden relative group cursor-pointer">
                        <ImageIcon size={28} className="text-gray-300" />
                        <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-200">
                            <Play size={20} className="text-white ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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

export { InvitePromoterModal };