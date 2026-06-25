import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useCampaign,
  useDeleteCampaign,
  useArchiveCampaign,
  useReopenCampaign,
} from "../features/campaigns/api";
import StatusBadge from "../components/StatusBadge";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useCampaign(id!);
  const deleteCampaign = useDeleteCampaign();
  const archiveCampaign = useArchiveCampaign();
  const reopenCampaign = useReopenCampaign();

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

  const handleDelete = () => {
    if (!confirm(`Delete "${campaign.title}"? This cannot be undone.`)) return;
    deleteCampaign.mutate(campaign.id, {
      onSuccess: () => {
        notifySuccess("Campaign deleted");
        navigate("/business/campaigns");
      },
      onError: () => notifyError("Failed to delete campaign"),
    });
  };

  const handleArchive = () => {
    archiveCampaign.mutate(campaign.id, {
      onSuccess: () => notifySuccess("Campaign archived"),
      onError: () => notifyError("Failed to archive campaign"),
    });
  };

  const handleReopen = () => {
    reopenCampaign.mutate(campaign.id, {
      onSuccess: () => notifySuccess("Campaign reopened"),
      onError: () => notifyError("Failed to reopen campaign"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/business/campaigns"
            className="text-sm text-primary hover:underline"
          >
            &larr; Back to Campaigns
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-text">{campaign.title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <StatusBadge status={campaign.status} />
          <Link
            to={`/business/campaigns/${campaign.id}/edit`}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Edit
          </Link>
          {campaign.status !== "ARCHIVED" ? (
            <button
              onClick={handleArchive}
              className="rounded border border-yellow-300 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50"
            >
              Archive
            </button>
          ) : (
            <button
              onClick={handleReopen}
              className="rounded border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              Reopen
            </button>
          )}
          <button
            onClick={handleDelete}
            className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-danger hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-text">Campaign Details</h2>
          <div>
            <span className="text-sm text-gray-500">Description</span>
            <p className="mt-1 text-text">{campaign.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Category</span>
              <p className="mt-1 font-medium text-text">{campaign.category}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Budget</span>
              <p className="mt-1 font-medium text-text">
                ${campaign.budget.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location</span>
              <p className="mt-1 font-medium text-text">{campaign.location}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Visibility</span>
              <p className="mt-1 font-medium text-text">{campaign.visibility}</p>
            </div>
          </div>
          {campaign.target_audience && (
            <div>
              <span className="text-sm text-gray-500">Target Audience</span>
              <p className="mt-1 text-text">{campaign.target_audience}</p>
            </div>
          )}
          {campaign.requirements && (
            <div>
              <span className="text-sm text-gray-500">Requirements</span>
              <p className="mt-1 text-text">{campaign.requirements}</p>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-text">Timeline</h2>
          <div>
            <span className="text-sm text-gray-500">Start Date</span>
            <p className="mt-1 font-medium text-text">
              {new Date(campaign.start_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">End Date</span>
            <p className="mt-1 font-medium text-text">
              {new Date(campaign.end_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Created</span>
            <p className="mt-1 font-medium text-text">
              {new Date(campaign.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Last Updated</span>
            <p className="mt-1 font-medium text-text">
              {new Date(campaign.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-text">Promoters</h2>
        <div className="mt-4 flex space-x-4">
          <Link
            to={`/business/campaigns/${campaign.id}/matches`}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Recommended Promoters
          </Link>
          <Link
            to={`/business/campaigns/${campaign.id}/applications`}
            className="rounded border px-4 py-2 text-sm font-medium text-text hover:bg-gray-50"
          >
            View Applications
          </Link>
        </div>
      </div>
    </div>
  );
}
