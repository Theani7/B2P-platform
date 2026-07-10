import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useCampaign,
  useDeleteCampaign,
  useArchiveCampaign,
  useReopenCampaign,
  usePublishCampaign,
} from "../features/campaigns/api";
import StatusBadge from "../components/StatusBadge";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader } from "../components/ui";
import { formatNepaliCurrency } from "../utils/currency";
import { Rocket } from "lucide-react";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useState } from "react";

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useCampaign(id!);
  const deleteCampaign = useDeleteCampaign();
  const archiveCampaign = useArchiveCampaign();
  const reopenCampaign = useReopenCampaign();
  const publishCampaign = usePublishCampaign();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-signal-blue border-t-transparent" />
      </div>
    );
  }

  if (!campaign) {
    return <div className="text-center text-ash py-8">Campaign not found</div>;
  }

  const handleDelete = () => {
    deleteCampaign.mutate(campaign.id, {
      onSuccess: () => {
        notifySuccess("Campaign deleted");
        navigate("/business/campaigns");
      },
      onError: () => notifyError("Failed to delete campaign"),
      onSettled: () => setShowDeleteConfirm(false),
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

  const handlePublish = () => {
    publishCampaign.mutate(campaign.id, {
      onSuccess: () => notifySuccess("Campaign published! It's now visible in the marketplace."),
      onError: (e) => notifyError(e.message || "Failed to publish campaign"),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/business/campaigns"
          className="text-xs text-signal-blue hover:underline inline-flex items-center gap-1 font-medium mb-3"
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
                className="bg-white border border-slate-custom/10 text-graphite rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-sky-wash transition-colors"
              >
                Edit
              </Link>
              {campaign.status === "DRAFT" && (
                <button
                  onClick={handlePublish}
                  className="bg-signal-blue text-white border border-signal-blue rounded-inputs px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-colors flex items-center gap-1.5"
                >
                  <Rocket size={14} /> Publish
                </button>
              )}
              {campaign.status !== "ARCHIVED" ? (
                <button
                  onClick={handleArchive}
                  className="bg-amber-tag/10 text-amber-tag border border-amber-tag/20 rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-amber-tag/20 transition-colors"
                >
                  Archive
                </button>
              ) : (
                <button
                  onClick={handleReopen}
                  className="bg-emerald-status/10 text-emerald-status border border-emerald-status/20 rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-emerald-status/20 transition-colors"
                >
                  Reopen
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-coral-alert/10 text-coral-alert border border-coral-alert/20 rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-coral-alert/20 transition-colors"
              >
                Delete
              </button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Details Card */}
        <div className="bg-white border border-slate-custom/10 rounded-cards p-5 space-y-4">
          <h2 className="text-heading text-graphite pb-2 border-b border-slate-custom/10">Campaign Details</h2>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Description</span>
            <p className="mt-1 text-sm text-graphite leading-relaxed">{campaign.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Category</span>
              <p className="mt-0.5 text-sm font-medium text-graphite">{campaign.category}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Budget</span>
              <p className="mt-0.5 text-sm font-medium text-graphite">
                {formatNepaliCurrency(campaign.budget)}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Location</span>
              <p className="mt-0.5 text-sm font-medium text-graphite">{campaign.location}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Visibility</span>
              <p className="mt-0.5 text-sm font-medium text-graphite">{campaign.visibility}</p>
            </div>
          </div>
          {campaign.target_audience && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Target Audience</span>
              <p className="mt-1 text-sm text-graphite leading-relaxed">{campaign.target_audience}</p>
            </div>
          )}
          {campaign.requirements && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Requirements</span>
              <p className="mt-1 text-sm text-graphite leading-relaxed">{campaign.requirements}</p>
            </div>
          )}
        </div>

        {/* Timeline Card */}
        <div className="bg-white border border-slate-custom/10 rounded-cards p-5 space-y-4">
          <h2 className="text-heading text-graphite pb-2 border-b border-slate-custom/10">Timeline</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Start Date</span>
              <p className="mt-0.5 text-sm font-medium text-graphite">
                {new Date(campaign.start_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-fog">End Date</span>
              <p className="mt-0.5 text-sm font-medium text-graphite">
                {new Date(campaign.end_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Created</span>
              <p className="mt-0.5 text-sm font-medium text-graphite">
                {new Date(campaign.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Last Updated</span>
              <p className="mt-0.5 text-sm font-medium text-graphite">
                {new Date(campaign.updated_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Promoters Section */}
      <div className="bg-white border border-slate-custom/10 rounded-cards p-5 space-y-4">
        <h2 className="text-heading text-graphite pb-2 border-b border-slate-custom/10">Promoter Matching</h2>
        <div className="flex gap-3">
          <Link
            to={`/business/campaigns/${campaign.id}/matches`}
            className="bg-signal-blue text-white rounded-button px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Recommended Promoters
          </Link>
          <Link
            to={`/business/campaigns/${campaign.id}/applications`}
            className="bg-white border border-slate-custom/10 text-graphite rounded-inputs px-4 py-2 text-sm font-medium hover:bg-sky-wash transition-colors"
          >
            View Applications
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${campaign.title}"? This cannot be undone.`}
        confirmText="Delete"
        loading={deleteCampaign.isPending}
      />
    </div>
  );
}
