import { useNavigate } from "react-router-dom";
import { useCreateCampaign } from "../features/campaigns/api";
import CampaignForm, { CampaignFormValues } from "../components/CampaignForm";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader } from "../components/ui";

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();

  const onSubmit = (data: CampaignFormValues) => {
    createCampaign.mutate(
      {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      },
      {
        onSuccess: () => {
          notifySuccess("Campaign created");
          navigate("/business/campaigns");
        },
        onError: () => notifyError("Failed to create campaign"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Create Campaign"
        description="Fill out the details below to launch a new promoter campaign"
      />
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <CampaignForm
          onSubmit={onSubmit}
          isSubmitting={createCampaign.isPending}
          submitLabel="Create Campaign"
        />
      </div>
    </div>
  );
}
