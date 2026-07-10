import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertCircle } from "lucide-react";
import { useCampaigns } from "@/features/campaigns/api";
import { useInvitePromoter } from "@/features/invitations/api";
import { useBusinessInvitations } from "@/features/invitations/api";
import { useBusinessApplications } from "@/features/applications/api";
import { toast } from "react-hot-toast";

interface InvitePromoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoter: any;
}

export default function InvitePromoterModal({ isOpen, onClose, promoter }: InvitePromoterModalProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [message, setMessage] = useState("");

  const { data: campaignsData, isLoading: campaignsLoading, error: campaignsError } = useCampaigns({ limit: 50 });
  const { data: invitationsData } = useBusinessInvitations({ limit: 100 });
  const { data: applicationsData } = useBusinessApplications({ limit: 100 });
  const invitePromoter = useInvitePromoter();

  if (!isOpen || !promoter) return null;

  const campaigns = campaignsData?.items || [];
  const invitations = invitationsData?.items || [];
  const applications = applicationsData?.items || [];

  const alreadyInvitedCampaignIds = new Set(
    invitations
      .filter((inv: any) => inv.promoterProfileId === promoter.id && inv.status === "PENDING")
      .map((inv: any) => inv.campaignId)
  );

  const alreadyAppliedCampaignIds = new Set(
    applications
      .filter((app: any) => app.promoterProfileId === promoter.id && app.status === "PENDING")
      .map((app: any) => app.campaignId)
  );

  const eligibleCampaigns = campaigns.filter((c: any) => 
    ["ACTIVE", "DRAFT", "OPEN"].includes(c.status) && !alreadyInvitedCampaignIds.has(c.id) && !alreadyAppliedCampaignIds.has(c.id)
  );

  const handleSend = () => {
    if (!selectedCampaignId) {
      toast.error("Please select a campaign first.");
      return;
    }

    if (alreadyInvitedCampaignIds.has(selectedCampaignId)) {
      toast.error(`You have already invited ${promoter.username} to this campaign.`);
      return;
    }
    if (alreadyAppliedCampaignIds.has(selectedCampaignId)) {
      toast.error(`${promoter.username} has already applied to this campaign.`);
      return;
    }

    invitePromoter.mutate(
      { promoterId: promoter.id, campaignId: selectedCampaignId, message },
      {
        onSuccess: () => {
          toast.success(`Invitation sent to ${promoter.username}!`);
          setSelectedCampaignId("");
          setMessage("");
          onClose();
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to send invitation.");
        }
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[102] flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col z-[103] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Invite {promoter.username}</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {campaignsError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  Error loading campaigns: {(campaignsError as Error).message}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  disabled={campaignsLoading || campaigns.length === 0}
                  className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-signal-blue focus:border-signal-blue outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">{campaignsLoading ? "Loading campaigns..." : eligibleCampaigns.length === 0 ? "No campaigns available" : "Choose a campaign"}</option>
                  {eligibleCampaigns.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {eligibleCampaigns.length === 0 && campaigns.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-gray-400" />
                    All your campaigns already have pending applications or invitations for this promoter.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Optional Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi, I'd love to collaborate with you on this campaign..."
                  rows={4}
                  className="w-full p-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-signal-blue focus:border-signal-blue outline-none transition-all resize-none"
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
                disabled={invitePromoter.isPending || !selectedCampaignId || eligibleCampaigns.length === 0}
                className="px-5 h-10 rounded-xl bg-signal-blue text-white font-medium text-sm hover:opacity-90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}
    </AnimatePresence>
  );
}
