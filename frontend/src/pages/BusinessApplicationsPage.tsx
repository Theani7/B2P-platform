import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaignApplications, useAcceptApplication, useRejectApplication } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { notifySuccess, notifyError } from "../hooks/useToast";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-500",
};

export default function BusinessApplicationsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCampaignApplications(campaignId ?? "", { page, limit: 20 });
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();

  const handleAccept = (id: string) => {
    acceptMutation.mutate(id, {
      onSuccess: () => notifySuccess("Application accepted, collaboration created"),
      onError: (e) => notifyError(e.message),
    });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id, {
      onSuccess: () => notifySuccess("Application rejected"),
      onError: (e) => notifyError(e.message),
    });
  };

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No applications yet"
        description="Promoters haven't applied to this campaign yet."
        action={
          <Link to="/business/campaigns" className="rounded bg-primary px-4 py-2 text-sm font-medium text-white">
            Back to Campaigns
          </Link>
        }
      />
    );
  }

  const items = data.items as any[];

  return (
    <div className="space-y-6">
      <Link to="/business/campaigns" className="inline-block text-sm text-primary hover:underline">
        &larr; Back to Campaigns
      </Link>
      <h1 className="text-2xl font-bold text-text">Applications</h1>

      <div className="space-y-4">
        {items.map((app: any) => (
          <div key={app.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {app.promoter_avatar_url ? (
                  <img src={app.promoter_avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  app.promoter_username?.[0]?.toUpperCase() ?? "?"
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-text">{app.promoter_username}</h3>
                      {app.promoter_verified && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">Verified</span>
                      )}
                    </div>
                    {app.promoter_headline && (
                      <p className="text-sm text-gray-600">{app.promoter_headline}</p>
                    )}
                  </div>
                  <span className={`rounded px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[app.status] ?? ""}`}>
                    {app.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium">{app.promoter_niche}</span>
                  {app.promoter_location && <span>{app.promoter_location}</span>}
                  <span>{app.promoter_followers_count?.toLocaleString()} followers</span>
                  <span>{app.promoter_engagement_rate?.toFixed(1)}% eng.</span>
                  {app.promoter_years_experience != null && (
                    <span>{app.promoter_years_experience}yr exp.</span>
                  )}
                </div>
                {app.message && (
                  <div className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-700">
                    <strong>Message:</strong> {app.message}
                  </div>
                )}
                {app.status === "PENDING" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAccept(app.id)}
                      disabled={acceptMutation.isPending}
                      className="rounded bg-success px-4 py-1.5 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      disabled={rejectMutation.isPending}
                      className="rounded border border-danger px-4 py-1.5 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {data.page} of {data.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page >= data.pages}
            className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
