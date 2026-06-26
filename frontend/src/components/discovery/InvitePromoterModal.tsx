import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useCampaigns } from "../../features/campaigns/api";
import { useInvitePromoter } from "../../features/collaboration/api";
import { notifySuccess, notifyError } from "../../hooks/useToast";

interface InvitePromoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoter: any;
}

export default function InvitePromoterModal({ isOpen, onClose, promoter }: InvitePromoterModalProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [message, setMessage] = useState("");

  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns({ limit: 50 });
  const invitePromoter = useInvitePromoter();

  if (!isOpen || !promoter) return null;

  const campaigns = campaignsData?.items || [];
  const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE" || c.status === "DRAFT"); // typically we invite to active/draft

  const handleSend = () => {
    if (!selectedCampaignId) {
      notifyError("Please select a campaign first.");
      return;
    }

    invitePromoter.mutate(
      { promoterId: promoter.id, campaignId: selectedCampaignId, message },
      {
        onSuccess: () => {
          notifySuccess(`Invitation sent to ${promoter.username}!`);
          setSelectedCampaignId("");
          setMessage("");
          onClose();
        },
        onError: (err: any) => {
          notifyError(err.message || "Failed to send invitation.");
        }
      }
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col z-[60] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Invite {promoter.username}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Campaign</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                disabled={campaignsLoading}
                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">{campaignsLoading ? "Loading campaigns..." : "Choose a campaign"}</option>
                {activeCampaigns.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Optional Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I'd love to collaborate with you on this campaign..."
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="p-6 pt-0 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 h-10 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={invitePromoter.isPending || !selectedCampaignId}
              className="px-5 h-10 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {invitePromoter.isPending ? "Sending..." : (
                <>
                  <Send size={16} />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
