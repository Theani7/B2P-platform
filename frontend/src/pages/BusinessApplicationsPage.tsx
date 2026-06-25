import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaignApplications, useAcceptApplication, useRejectApplication } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader, Avatar, Badge } from "../components/ui";
import {
  ArrowLeft,
  MapPin,
  Users,
  TrendingUp,
  Star,
  MessageSquare,
  Briefcase,
  Eye,
  BadgeCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function BusinessApplicationsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCampaignApplications(campaignId ?? "", { page, limit: 20 });
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();
  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-brand-coral-50 flex items-center justify-center mb-4 ring-1 ring-brand-coral/10">
        <XCircle size={32} className="text-brand-coral" />
      </div>
      <p className="text-lg font-medium text-gray-900">Error loading applications</p>
      <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
    </div>
  );

  const handleAccept = (id: string) => {
    acceptMutation.mutate(id, {
      onSuccess: () => notifySuccess("Application accepted — collaboration created!"),
      onError: (e) => notifyError(e.message),
    });
  };

  const handleReject = (id: string) => {
    setRejectConfirm(id);
  };

  const confirmReject = () => {
    if (!rejectConfirm) return;
    rejectMutation.mutate(rejectConfirm, {
      onSuccess: () => { notifySuccess("Application rejected"); setRejectConfirm(null); },
      onError: (e) => { notifyError(e.message); setRejectConfirm(null); },
    });
  };

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.items.length === 0) {
    return (
      <div className="space-y-6">
        <Link to="/business/campaigns" className="text-xs text-brand-purple hover:underline inline-flex items-center gap-1 font-medium mb-3">
          &larr; Back to Campaigns
        </Link>
        <EmptyState
          title="No applications yet"
          description="Promoters haven't applied to this campaign yet. Try promoting it more or inviting specific promoters."
          action={
            <Link to="/business/campaigns" className="inline-flex items-center gap-2 bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              <ArrowLeft size={16} />
              Back to Campaigns
            </Link>
          }
        />
      </div>
    );
  }

  const items = data.items as any[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/business/campaigns" className="text-xs text-brand-purple hover:underline inline-flex items-center gap-1 font-medium mb-3">
          &larr; Back to Campaigns
        </Link>
        <PageHeader
          title="Applications"
          description={`${data.total} applicant${data.total !== 1 ? 's' : ''} found for this campaign.`}
        />
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {items.map((app: any) => {
          const badgeVariant =
            app.status === "PENDING"
              ? "pending"
              : app.status === "ACCEPTED"
              ? "verified"
              : app.status === "REJECTED"
              ? "rejected"
              : "draft";

          return (
            <div
              key={app.id}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors duration-150"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {app.promoter_avatar_url ? (
                      <img src={app.promoter_avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <Avatar initials={app.promoter_username?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={app.id?.charCodeAt(0) || 0} />
                    )}
                    {app.promoter_verified && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-teal flex items-center justify-center ring-2 ring-white">
                        <BadgeCheck size={10} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">{app.promoter_username}</h3>
                          {app.promoter_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-teal-50 text-brand-teal-900 ring-1 ring-brand-teal/10">
                              <BadgeCheck size={10} />
                              Verified
                            </span>
                          )}
                        </div>
                        {app.promoter_headline && (
                          <p className="text-xs text-gray-500 mt-0.5">{app.promoter_headline}</p>
                        )}
                      </div>
                      <Badge variant={badgeVariant}>
                        {app.status}
                      </Badge>
                    </div>

                    {/* Stats Row */}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-700 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                        <Briefcase size={10} className="text-brand-purple" />
                        {app.promoter_niche}
                      </span>
                      {app.promoter_location && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={10} className="text-gray-400" />
                          {app.promoter_location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Users size={10} className="text-gray-400" />
                        {app.promoter_followers_count?.toLocaleString()} followers
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-brand-teal font-medium">
                        <TrendingUp size={10} />
                        {app.promoter_engagement_rate?.toFixed(1)}% eng.
                      </span>
                      {app.promoter_years_experience != null && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Star size={10} className="text-gray-400" />
                          {app.promoter_years_experience}yr exp.
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    {app.message && (
                      <div className="mt-3.5 flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <MessageSquare size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600">{app.message}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {app.status === "PENDING" && (
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => handleAccept(app.id)}
                          disabled={acceptMutation.isPending}
                          className="bg-brand-teal-50 text-brand-teal-900 border border-teal-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-teal-100 transition-colors inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={12} />
                          {acceptMutation.isPending ? "Accepting..." : "Accept"}
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          disabled={rejectMutation.isPending}
                          className="bg-brand-coral-50 text-brand-coral-900 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition-colors inline-flex items-center gap-1.5"
                        >
                          <XCircle size={12} />
                          {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                        </button>
                        <Link
                          to={`/promoters/${app.promoter_username}`}
                          className="text-xs text-brand-purple hover:underline flex items-center gap-1 font-medium ml-auto"
                        >
                          <Eye size={12} />
                          View Profile
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <ArrowLeft size={12} />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? "bg-brand-indigo text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page >= data.pages}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Next
            <ArrowLeft size={12} className="rotate-180" />
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!rejectConfirm}
        onClose={() => setRejectConfirm(null)}
        onConfirm={confirmReject}
        title="Reject Application"
        message="Are you sure you want to reject this application? This action cannot be undone."
      />
    </div>
  );
}
