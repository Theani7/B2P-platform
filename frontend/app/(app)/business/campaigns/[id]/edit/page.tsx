"use client";

import { use, useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useCampaign, useUpdateCampaign } from "@/features/campaigns/api";
import type { CampaignUpdatePayload } from "@/features/campaigns/types";

function EditCampaignInner({ id }: { id: string }) {
  const router = useRouter();
  const { data: campaign, isLoading } = useCampaign(id);
  const update = useUpdateCampaign();

  if (isLoading) return <Spinner />;
  if (!campaign) return <p className="text-body text-coral-alert">Campaign not found.</p>;

  const onSubmit = (data: CampaignUpdatePayload) => {
    update.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Campaign updated");
          router.push(`/business/campaigns/${id}`);
        },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to update campaign"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit Campaign"
        subtitle="Update your campaign details and visibility status"
      />
      <Card>
        <CampaignForm campaign={campaign} submitting={update.isPending} onSubmit={onSubmit} />
      </Card>
    </div>
  );
}

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireAuth role={Role.BUSINESS}>
      <EditCampaignInner id={id} />
    </RequireAuth>
  );
}
