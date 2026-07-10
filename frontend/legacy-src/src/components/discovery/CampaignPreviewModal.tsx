import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Clock, CheckCircle, Calendar, Briefcase, MapPin, Eye, Send } from "lucide-react";
import { formatNepaliCurrency } from "../../utils/currency";

interface CampaignPreviewModalProps {
  campaign: any;
  onClose: () => void;
  onApply: (campaignId: string, title: string) => void;
}

export default function CampaignPreviewModal({ campaign, onClose, onApply }: CampaignPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (campaign) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [campaign]);

  if (!campaign || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden relative my-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
            <h2 className="text-lg font-bold text-gray-900">Campaign Details</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-white ring-1 ring-gray-200 flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-sm">
                {campaign.business_name?.charAt(0).toUpperCase() || 'B'}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{campaign.business_name}</h3>
                  <CheckCircle size={16} className="text-primary-500" />
                </div>
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 bg-gray-100 uppercase tracking-wider">
                  {campaign.category}
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-4">{campaign.title}</h1>

            {/* Key Metrics */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold ring-1 ring-emerald-600/20 shadow-sm">
                {formatNepaliCurrency(campaign.budget)}
              </span>
              <span className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-semibold ring-1 ring-gray-200 shadow-sm">
                <Clock size={16}/> {Math.max(1, Math.ceil((new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / (1000 * 60 * 60 * 24)))} days duration
              </span>
              <span className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-semibold ring-1 ring-gray-200 shadow-sm">
                <MapPin size={16}/> {campaign.location || 'Remote'}
              </span>
            </div>

            {/* Description Sections */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Briefcase size={16} className="text-gray-400" /> Campaign Description
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {campaign.description || "No description provided."}
                </p>
              </div>

              {(campaign.requirements || campaign.target_audience) && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} className="text-gray-400" /> Requirements & Target Audience
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    {campaign.requirements && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-semibold text-gray-800">Requirements:</span> {campaign.requirements}
                      </p>
                    )}
                    {campaign.target_audience && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-semibold text-gray-800">Target Audience:</span> {campaign.target_audience}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dates & Meta */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Created: {new Date(campaign.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> Visibility: {campaign.visibility}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0">
            <button 
              onClick={onClose}
              className="h-11 px-6 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-white shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (!campaign.has_applied) {
                  onClose();
                  onApply(campaign.id, campaign.title);
                }
              }}
              disabled={campaign.has_applied}
              className={`h-11 px-8 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-colors ${
                campaign.has_applied
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-primary-600'
              }`}
            >
              {campaign.has_applied ? (
                <>Applied</>
              ) : (
                <><Send size={16} /> Apply Now</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
