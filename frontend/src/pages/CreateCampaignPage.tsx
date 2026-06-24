import { useNavigate } from "react-router-dom";
import { useCreateCampaign } from "../features/campaigns/api";
import CampaignForm, { CampaignFormValues } from "../components/CampaignForm";
import { notifySuccess, notifyError } from "../hooks/useToast";

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
      <h1 className="text-2xl font-bold text-text">Create Campaign</h1>
      <div className="rounded-lg border p-6">
        <CampaignForm
          onSubmit={onSubmit}
          isSubmitting={createCampaign.isPending}
          submitLabel="Create Campaign"
        />
      </div>
    </div>
  );
}
