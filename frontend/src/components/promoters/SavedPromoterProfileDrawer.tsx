import { useEffect, useState } from "react";
import { X, BadgeCheck, MapPin, Briefcase, Users, TrendingUp, Star, Image as ImageIcon, Play, UserPlus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "../ui";
import InvitePromoterModal from "../discovery/InvitePromoterModal";

export function ProfileDrawer({ isOpen, onClose, promoter, onRemove }: any) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !promoter) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
          animate={{ x: 0, boxShadow: "-10px 0 30px rgba(0,0,0,0.1)" }}
          exit={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white h-full flex flex-col z-[101] shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Profile Preview</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                {promoter.avatar_url ? (
                  <img src={promoter.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-50" />
                ) : (
                  <Avatar initials={promoter.username?.[0]?.toUpperCase() ?? "?"} size="lg" colorIndex={promoter.id?.charCodeAt(0) || 0} />
                )}
                {promoter.verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center ring-4 ring-white">
                    <BadgeCheck size={14} className="text-white" />
                  </div>
                )}
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-bold text-gray-900 leading-none">{promoter.username}</h3>
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

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
                <Users size={16} className="text-gray-400 mb-1" />
                <span className="text-lg font-bold text-gray-900">{(promoter.followers_count || 0).toLocaleString()}</span>
                <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Followers</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
                <TrendingUp size={16} className="text-emerald-500 mb-1" />
                <span className="text-lg font-bold text-gray-900">{(promoter.engagement_rate || 0).toFixed(1)}%</span>
                <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Engagement</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
                <Star size={16} className="text-amber-400 mb-1" />
                <span className="text-lg font-bold text-gray-900">4.9</span>
                <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Rating</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">About</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {promoter.bio || "This promoter hasn't added a bio yet. They mainly focus on creating high-quality content for their audience."}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Portfolio</h4>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gray-100 flex flex-col items-center justify-center border border-gray-200/60 overflow-hidden relative group">
                    <ImageIcon size={20} className="text-gray-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <Play size={20} className="text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white h-11 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <UserPlus size={16} /> Invite to Campaign
            </button>
            <button 
              onClick={() => onRemove(promoter.id, promoter.username)}
              className="w-11 h-11 rounded-lg bg-white border border-gray-200 text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors shadow-sm"
              title="Remove from Saved"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      <InvitePromoterModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        promoter={promoter} 
      />
    </AnimatePresence>
  );
}