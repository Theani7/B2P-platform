import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Heart, Briefcase, Calendar, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { getMediaUrl } from "./PortfolioCard";
import { useViewPortfolio, useLikePortfolio } from "@/features/portfolio/api";

interface PortfolioDetailModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PortfolioDetailModal({ item, isOpen, onClose }: PortfolioDetailModalProps) {
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const viewPortfolio = useViewPortfolio();
  const likePortfolio = useLikePortfolio();

  useEffect(() => {
    if (isOpen && item) {
      document.body.style.overflow = "hidden";
      setCurrentMediaIdx(0);
      viewPortfolio.mutate(item.id);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, item?.id]);

  if (!isOpen || !item) return null;

  // Use all available media, or fallback to coverImage, or empty
  const mediaItems = item.media?.length ? item.media : (item.coverImage ? [{ filePath: item.coverImage }] : []);
  const hasMedia = mediaItems.length > 0;

  const nextMedia = () => setCurrentMediaIdx((i) => (i + 1) % mediaItems.length);
  const prevMedia = () => setCurrentMediaIdx((i) => (i - 1 + mediaItems.length) % mediaItems.length);

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-[#020520]/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="relative w-full max-w-[1200px] max-h-[90vh] bg-linen-canvas rounded-[32px] shadow-2xl flex flex-col md:flex-row z-[1101] overflow-hidden border border-steel/10"
        >
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/80 hover:bg-white text-graphite shadow-sm border border-steel/10 transition-all z-[1110] backdrop-blur-md"
          >
            <X size={20} />
          </button>

          {/* Left Area - Media Viewer */}
          <div className="w-full md:w-3/5 lg:w-2/3 bg-gray-50 flex items-center justify-center relative overflow-hidden group border-b md:border-b-0 md:border-r border-steel/10 min-h-[40vh] md:min-h-0">
            {hasMedia ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentMediaIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    src={getMediaUrl(mediaItems[currentMediaIdx].filePath)}
                    alt={`${item.title} preview`}
                    className="w-full h-full object-contain absolute inset-0"
                  />
                </AnimatePresence>

                {mediaItems.length > 1 && (
                  <>
                    <button onClick={prevMedia} className="absolute left-4 p-2 rounded-full bg-white/70 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronLeft size={24} className="text-midnight-ink" />
                    </button>
                    <button onClick={nextMedia} className="absolute right-4 p-2 rounded-full bg-white/70 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={24} className="text-midnight-ink" />
                    </button>
                    <div className="absolute bottom-4 flex gap-1.5">
                      {mediaItems.map((_, idx) => (
                        <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentMediaIdx ? 'bg-signal-blue w-6' : 'bg-steel/40'}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-steel">
                <Briefcase size={48} className="opacity-20 mb-4" />
                <span className="text-sm font-medium">No media provided</span>
              </div>
            )}
          </div>

          {/* Right Area - Details */}
          <div className="w-full md:w-2/5 lg:w-1/3 bg-white flex flex-col overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-midnight-ink tracking-tight font-inter mb-2 leading-tight">
                {item.title}
              </h2>
              {item.clientName && (
                <div className="text-signal-blue font-semibold text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={14} /> 
                  for {item.clientName}
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-steel/10">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-midnight-ink">{item.views > 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views || 0}</span>
                <span className="text-[10px] font-bold text-steel uppercase tracking-widest flex items-center gap-1">
                  <Eye size={10} /> VIEWS
                </span>
              </div>
              <button 
                onClick={() => likePortfolio.mutate(item.id)}
                disabled={likePortfolio.isPending}
                className="flex flex-col border-l border-steel/10 pl-6 group text-left transition-colors"
              >
                <span className="text-2xl font-bold text-midnight-ink group-hover:text-signal-blue transition-colors">
                  {item.likes > 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes || 0}
                </span>
                <span className="text-[10px] font-bold text-steel uppercase tracking-widest flex items-center gap-1 group-hover:text-signal-blue transition-colors">
                  <Heart size={10} className={likePortfolio.isPending ? "fill-signal-blue text-signal-blue" : ""} /> 
                  {likePortfolio.isPending ? "LIKING..." : "LIKE"}
                </span>
              </button>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-midnight-ink uppercase tracking-widest mb-3">Project Description</h3>
              <p className="text-sm text-slate leading-relaxed whitespace-pre-wrap font-inter">
                {item.description || "No description provided for this portfolio item."}
              </p>
            </div>

            {/* Campaign Type */}
            {item.campaignType && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-midnight-ink uppercase tracking-widest mb-3">Campaign Type</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-wash text-signal-blue">
                  {item.campaignType}
                </span>
              </div>
            )}

            {/* Platforms & Tags */}
            <div className="mb-8">
              {(item.platforms?.length > 0 || item.tags?.length > 0) && (
                <h3 className="text-xs font-bold text-midnight-ink uppercase tracking-widest mb-3">Categories & Tags</h3>
              )}
              <div className="flex flex-wrap gap-2">
                {item.platforms?.map((p: string, i: number) => (
                  <span key={`${p}-${i}`} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-100">
                    {p}
                  </span>
                ))}
                {item.tags?.map((t: string, i: number) => (
                  <span key={`${t}-${i}`} className="px-3 py-1.5 bg-steel/5 text-slate text-xs font-medium rounded-lg border border-steel/10 flex items-center gap-1">
                    <Tag size={10} className="text-steel" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
