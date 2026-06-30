import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, X, RefreshCw, ArrowRight } from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function VerificationModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  title = "Review Verification Request",
  description = "Please review the information below carefully. This is exactly what will be submitted to our review team.",
  children
}: VerificationModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-midnight-ink/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-cards-lg shadow-2xl overflow-hidden border border-white/20 z-10 my-8"
        >
          {/* Header Gradient */}
          <div className="h-32 bg-gradient-to-br from-signal-blue via-azure-info to-periwinkle-glow relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-elevated"
            >
              <BadgeCheck className="text-white" size={32} />
            </motion.div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full backdrop-blur-sm transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 bg-white">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-graphite tracking-tight">{title}</h3>
              <p className="text-sm text-ash">{description}</p>
            </div>

            <div className="bg-sky-wash/50 border border-signal-blue/10 rounded-cards p-5 space-y-4 shadow-inner">
              {children}
            </div>

            <div className="flex items-start gap-3 bg-amber-tag/10 p-4 rounded-inputs border border-amber-tag/20">
              <div className="text-amber-tag shrink-0 mt-0.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <p className="text-xs text-graphite font-medium leading-relaxed">
                Once submitted, you will not be able to edit this information until a decision is made.
              </p>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-5 border-t border-slate-custom/10 bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-ash hover:text-graphite hover:bg-slate-custom/5 rounded-button transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-2.5 bg-signal-blue text-white text-sm font-bold rounded-button hover:bg-signal-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-blue-focus hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Request <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
