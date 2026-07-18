"use client";

import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { useProfileShare, useCampaignShare } from "@/features/sharing/api";

export function ShareDialog({
  campaignId,
  open,
  onClose,
}: {
  campaignId?: string;
  open: boolean;
  onClose: () => void;
}) {
  const profile = useProfileShare();
  const campaign = useCampaignShare(campaignId ?? "");

  if (!open) return null;

  const data = campaignId ? campaign.data : profile.data;
  const loading = campaignId ? campaign.isLoading : profile.isLoading;
  const url = data?.publicUrl ?? "";
  const title = campaignId ? campaign.data?.title ?? "Campaign" : "Your profile";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      notifySuccess("Link copied");
    } catch {
      notifyError("Could not copy");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-modals bg-white p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-heading-sm font-semibold text-midnight-ink">Share {title}</h2>
        {loading && <p className="mt-4 text-body text-steel">Loading…</p>}
        {url && (
          <div className="mt-4">
            <p className="mb-1 text-caption font-medium uppercase tracking-wide text-steel">Public link</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink"
              />
              <Button onClick={copy}>Copy</Button>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
