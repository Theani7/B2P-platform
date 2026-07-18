import { useParams, useNavigate } from "react-router-dom";
import { useCampaign, useUpdateCampaign } from "../features/campaigns/api";
import CampaignForm, { CampaignFormValues } from "../components/CampaignForm";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader } from "../components/ui";

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useCampaign(id!);
  const updateCampaign = useUpdateCampaign();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!campaign) {
    return <div className="text-center text-gray-600">Campaign not found</div>;
  }

  const defaultValues: CampaignFormValues = {
    title: campaign.title,
    description: campaign.description,
    category: campaign.category,
    budget: campaign.budget,
    location: campaign.location,
    target_audience: campaign.target_audience ?? "",
    requirements: campaign.requirements ?? "",
    start_date: new Date(campaign.start_date).toISOString().split("T")[0],
    end_date: new Date(campaign.end_date).toISOString().split("T")[0],
    visibility: campaign.visibility,
    status: campaign.status,
  };

  const onSubmit = (data: CampaignFormValues) => {
    updateCampaign.mutate(
      {
        id: campaign.id,
        data: {
          ...data,
          start_date: new Date(data.start_date).toISOString(),
          end_date: new Date(data.end_date).toISOString(),
        },
      },
      {
        onSuccess: () => {
          notifySuccess("Campaign updated");
          navigate(`/business/campaigns/${campaign.id}`);
        },
        onError: () => notifyError("Failed to update campaign"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit Campaign"
        description="Update your campaign details and visibility status"
      />
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <CampaignForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSubmitting={updateCampaign.isPending}
          submitLabel="Update Campaign"
        />
      </div>
    </div>
  );
}
