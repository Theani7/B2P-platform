import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaignApplications, useAcceptApplication, useRejectApplication } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Star,
  MessageSquare,
  Briefcase,
  Eye,
  BadgeCheck,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-brand-amber-50 text-brand-amber-900 ring-brand-amber/20",
  ACCEPTED: "bg-brand-teal-50 text-brand-teal-900 ring-brand-teal/20",
  REJECTED: "bg-brand-coral-50 text-brand-coral-900 ring-brand-coral/20",
  WITHDRAWN: "bg-gray-100 text-gray-500 ring-gray-200",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  ACCEPTED: CheckCircle2,
  REJECTED: XCircle,
  WITHDRAWN: XCircle,
};

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
        <Link to="/business/campaigns" className="inline-flex items-center gap-2 text-sm text-brand-purple hover:text-brand-purple-900 font-medium transition-colors">
          <ArrowLeft size={16} />
          Back to Campaigns
        </Link>
        <EmptyState
          title="No applications yet"
          description="Promoters haven't applied to this campaign yet. Try promoting it more or inviting specific promoters."
          action={
            <Link to="/business/campaigns" className="inline-flex items-center gap-2 bg-brand-purple text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/business/campaigns"
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-medium text-gray-900">Applications</h1>
            <p className="text-xs text-gray-500 mt-0.5">{data.total} applicant{data.total !== 1 ? 's' : ''} found</p>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {items.map((app: any) => {
          const StatusIcon = STATUS_ICONS[app.status] || Clock;
          return (
            <div
              key={app.id}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="p-6">
                <div className="flex items-start gap-5">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple-50 to-brand-indigo-50 flex items-center justify-center text-xl font-bold text-brand-purple-900 ring-1 ring-brand-purple/10 overflow-hidden">
                      {app.promoter_avatar_url ? (
                        <img src={app.promoter_avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        app.promoter_username?.[0]?.toUpperCase() ?? "?"
                      )}
                    </div>
                    {app.promoter_verified && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-teal flex items-center justify-center ring-2 ring-white">
                        <BadgeCheck size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-medium text-gray-900">{app.promoter_username}</h3>
                          {app.promoter_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-teal-50 text-brand-teal-900 ring-1 ring-brand-teal/10">
                              <BadgeCheck size={10} />
                              Verified
                            </span>
                          )}
                        </div>
                        {app.promoter_headline && (
                          <p className="text-sm text-gray-500 mt-0.5">{app.promoter_headline}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium ring-1 flex-shrink-0 ${STATUS_STYLES[app.status] ?? ""}`}>
                        <StatusIcon size={12} />
                        {app.status}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg ring-1 ring-gray-100">
                        <Briefcase size={12} className="text-brand-purple" />
                        {app.promoter_niche}
                      </span>
                      {app.promoter_location && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin size={12} className="text-gray-400" />
                          {app.promoter_location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                        <Users size={12} className="text-gray-400" />
                        {app.promoter_followers_count?.toLocaleString()} followers
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-brand-teal font-medium">
                        <TrendingUp size={12} />
                        {app.promoter_engagement_rate?.toFixed(1)}% eng.
                      </span>
                      {app.promoter_years_experience != null && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <Star size={12} className="text-gray-400" />
                          {app.promoter_years_experience}yr exp.
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    {app.message && (
                      <div className="mt-4 flex gap-3 p-4 bg-gray-50 rounded-xl ring-1 ring-gray-100">
                        <MessageSquare size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{app.message}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {app.status === "PENDING" && (
                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => handleAccept(app.id)}
                          disabled={acceptMutation.isPending}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-teal to-brand-teal-900 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                        >
                          <CheckCircle2 size={16} />
                          {acceptMutation.isPending ? "Accepting..." : "Accept"}
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          disabled={rejectMutation.isPending}
                          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-50 hover:text-brand-coral hover:border-brand-coral/30 transition-all disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                        </button>
                        <Link
                          to={`/promoters/${app.promoter_username}`}
                          className="inline-flex items-center gap-2 text-sm text-brand-purple hover:text-brand-purple-900 font-medium ml-auto transition-colors"
                        >
                          <Eye size={16} />
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
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft size={14} />
            Previous
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  p === page
                    ? "bg-brand-purple text-white"
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
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ArrowLeft size={14} className="rotate-180" />
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
