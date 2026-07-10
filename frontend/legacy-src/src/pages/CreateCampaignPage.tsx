import { useNavigate } from "react-router-dom";
import { useCreateCampaign } from "../features/campaigns/api";
import CampaignForm, { CampaignFormValues } from "../components/CampaignForm";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader } from "../components/ui";
import { useForm } from "react-hook-form";

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  const methods = useForm<CampaignFormValues>();

  const onSubmit = (data: CampaignFormValues) => {
    createCampaign.mutate(
      {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      },
      {
        onSuccess: (response: any) => {
          notifySuccess("Campaign created! You can now review and publish it.");
          // API interceptor might unwrap data, handle both response shapes
          const campaignId = response?.data?.id || response?.id;
          if (campaignId) {
            navigate(`/business/campaigns/${campaignId}`);
          } else {
            navigate("/business/campaigns");
          }
        },
        onError: () => notifyError("Failed to create campaign"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <div className="bg-white border border-slate-custom/10 rounded-xl p-8 shadow-sm">
        <PageHeader
          title="Create Campaign"
          description="Fill out the details below to launch a new promoter campaign"
        />
        <div className="mt-8">
          <CampaignForm
            onSubmit={onSubmit}
            isSubmitting={createCampaign.isPending}
            submitLabel="Create Campaign"
          />
        </div>
      </div>
    </div>
  );
}
