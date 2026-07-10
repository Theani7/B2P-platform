"use client";

import { useState } from "react";
import { X, Send, AlertCircle } from "lucide-react";
import { useCampaigns } from "@/features/campaigns/api";
import { useInvitePromoter } from "@/features/invitations/api";
import { useAuth } from "@/providers/AuthProvider";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";

interface InvitePromoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoter: { id: string; username: string };
}

export function InvitePromoterModal({ isOpen, onClose, promoter }: InvitePromoterModalProps) {
  const { user } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [message, setMessage] = useState("");

  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns({ limit: 50 });
  const invitePromoter = useInvitePromoter();

  if (!isOpen || !promoter) return null;
  if (user?.role !== Role.BUSINESS) return null;

  const campaigns = campaignsData?.items ?? [];
  const eligibleCampaigns = campaigns.filter((c: any) =>
    ["ACTIVE", "DRAFT", "OPEN"].includes(c.status),
  );

  const handleSend = () => {
    if (!selectedCampaignId) {
      notifyError("Please select a campaign first.");
      return;
    }
    invitePromoter.mutate(
      { campaignId: selectedCampaignId, promoterId: promoter.id, message },
      {
        onSuccess: () => {
          notifySuccess(`Invitation sent to ${promoter.username}!`);
          setSelectedCampaignId("");
          setMessage("");
          onClose();
        },
        onError: (err: any) => {
          if (err?.response?.status === 409) {
            notifyError(`You have already invited ${promoter.username} to this campaign.`);
          } else {
            notifyError(err?.response?.data?.message ?? "Failed to send invitation.");
          }
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-[2001] flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-lg font-bold text-graphite">Invite {promoter.username}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Select Campaign</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              disabled={campaignsLoading || eligibleCampaigns.length === 0}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-all focus:border-signal-blue focus:ring-2 focus:ring-signal-blue disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">
                {campaignsLoading
                  ? "Loading campaigns..."
                  : eligibleCampaigns.length === 0
                    ? "No campaigns available"
                    : "Choose a campaign"}
              </option>
              {eligibleCampaigns.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Optional Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'd love to collaborate with you on this campaign..."
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none transition-all focus:border-signal-blue focus:ring-2 focus:ring-signal-blue"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="h-10 rounded-xl px-5 font-medium text-sm text-gray-600 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={invitePromoter.isPending || !selectedCampaignId || eligibleCampaigns.length === 0}
            className="flex h-10 items-center gap-2 rounded-xl bg-signal-blue px-5 font-medium text-sm text-white shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {invitePromoter.isPending ? "Sending..." : (<><Send size={16} /> Send Invitation</>)}
          </button>
        </div>
      </div>
    </div>
  );
}
