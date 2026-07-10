"use client";

import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, PageHeader } from "@/components/ui/Card";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useCreateCampaign } from "@/features/campaigns/api";
import type { CampaignCreatePayload } from "@/features/campaigns/types";

function NewCampaignInner() {
  const router = useRouter();
  const create = useCreateCampaign();

  const onSubmit = (data: CampaignCreatePayload) => {
    create.mutate(data, {
      onSuccess: (c) => {
        toast.success("Campaign created");
        router.push(`/business/campaigns/${c.id}`);
      },
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Could not create campaign"),
    });
  };

  return (
    <div>
      <PageHeader title="New campaign" subtitle="Define the campaign brief for promoters." />
      <Card>
        <CampaignForm submitting={create.isPending} onSubmit={onSubmit} />
      </Card>
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
