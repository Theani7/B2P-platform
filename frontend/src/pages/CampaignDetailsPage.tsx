import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useCampaign,
  useDeleteCampaign,
  useArchiveCampaign,
  useReopenCampaign,
} from "../features/campaigns/api";
import StatusBadge from "../components/StatusBadge";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader } from "../components/ui";

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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
      </div>
    );
  }

  if (!campaign) {
    return <div className="text-center text-gray-500 py-8">Campaign not found</div>;
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
      <div>
        <Link
          to="/business/campaigns"
          className="text-xs text-brand-purple hover:underline inline-flex items-center gap-1 font-medium mb-3"
        >
          &larr; Back to Campaigns
        </Link>
        <PageHeader
          title={campaign.title}
          description="View campaign details, requirements, timeline and promoter applications."
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={campaign.status} />
              <Link
                to={`/business/campaigns/${campaign.id}/edit`}
                className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Edit
              </Link>
              {campaign.status !== "ARCHIVED" ? (
                <button
                  onClick={handleArchive}
                  className="bg-brand-amber-50 text-brand-amber-900 border border-brand-amber/20 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-brand-amber-50/80 transition-colors"
                >
                  Archive
                </button>
              ) : (
                <button
                  onClick={handleReopen}
                  className="bg-brand-teal-50 text-brand-teal-900 border border-brand-teal/20 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-brand-teal-50/80 transition-colors"
                >
                  Reopen
                </button>
              )}
              <button
                onClick={handleDelete}
                className="bg-brand-coral-50 text-brand-coral-900 border border-brand-coral/20 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-brand-coral-50/80 transition-colors"
              >
                Delete
              </button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Details Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-medium text-gray-900 pb-2 border-b border-gray-100">Campaign Details</h2>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Description</span>
            <p className="mt-1 text-sm text-gray-700 leading-relaxed">{campaign.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Category</span>
              <p className="mt-0.5 text-sm font-medium text-gray-900">{campaign.category}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Budget</span>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                ${campaign.budget.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Location</span>
              <p className="mt-0.5 text-sm font-medium text-gray-900">{campaign.location}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Visibility</span>
              <p className="mt-0.5 text-sm font-medium text-gray-900">{campaign.visibility}</p>
            </div>
          </div>
          {campaign.target_audience && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Target Audience</span>
              <p className="mt-1 text-sm text-gray-700 leading-relaxed">{campaign.target_audience}</p>
            </div>
          )}
          {campaign.requirements && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Requirements</span>
              <p className="mt-1 text-sm text-gray-700 leading-relaxed">{campaign.requirements}</p>
            </div>
          )}
        </div>

        {/* Timeline Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-medium text-gray-900 pb-2 border-b border-gray-100">Timeline</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Start Date</span>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {new Date(campaign.start_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">End Date</span>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {new Date(campaign.end_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Created</span>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {new Date(campaign.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Last Updated</span>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {new Date(campaign.updated_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Promoters Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <h2 className="text-base font-medium text-gray-900 pb-2 border-b border-gray-100">Promoter Matching</h2>
        <div className="flex gap-3">
          <Link
            to={`/business/campaigns/${campaign.id}/matches`}
            className="bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Recommended Promoters
          </Link>
          <Link
            to={`/business/campaigns/${campaign.id}/applications`}
            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            View Applications
          </Link>
        </div>
      </div>
    </div>
  );
}
