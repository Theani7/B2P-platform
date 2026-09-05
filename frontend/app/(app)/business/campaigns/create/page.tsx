"use client";

import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useRouter } from "next/navigation";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useCreateCampaign } from "@/features/campaigns/api";
import type { CampaignCreatePayload } from "@/features/campaigns/types";

function NewCampaignInner() {
  const router = useRouter();
  const create = useCreateCampaign();

  const onSubmit = (data: CampaignCreatePayload) => {
    create.mutate(data, {
      onSuccess: (c) => {
        notifySuccess("Campaign created");
        router.push(`/business/campaigns/${c.id}`);
      },
      onError: (e: any) => notifyError(e?.response?.data?.message ?? "Could not create campaign"),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 120% at 100% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0) 60%)" }}
        />
        <div className="relative">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-midnight-ink">New campaign</h1>
          <p className="text-sm text-ash mt-2">Define the campaign brief for promoters.</p>
        </div>
      </div>
      <div className="rounded-cards-lg border border-steel/10 bg-white p-6 shadow-product-card sm:p-8">
        <CampaignForm submitting={create.isPending} onSubmit={onSubmit} />
      </div>
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <RequireAuth role={Role.BUSINESS}>
      <NewCampaignInner />
    </RequireAuth>
  );
}
