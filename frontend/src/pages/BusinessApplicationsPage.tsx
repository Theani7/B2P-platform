import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaignApplications, useAcceptApplication, useRejectApplication } from "../features/collaboration/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { PageHeader, Avatar, Badge } from "../components/ui";
import { Table, TableColumn } from "../components/ui/Table";
import {
  ArrowLeft,
  Users,
  TrendingUp,
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
      <div className="w-16 h-16 rounded-cards bg-coral-alert/10 flex items-center justify-center mb-4">
        <XCircle size={32} className="text-coral-alert" />
      </div>
      <p className="text-lg font-medium text-graphite">Error loading applications</p>
      <p className="text-sm text-ash mt-1">{(error as Error).message}</p>
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
        <Link to="/business/campaigns" className="text-xs text-signal-blue hover:underline inline-flex items-center gap-1 font-medium mb-3">
          &larr; Back to Campaigns
        </Link>
        <EmptyState
          title="No applications yet"
          description="Promoters haven't applied to this campaign yet. Try promoting it more or inviting specific promoters."
          action={
            <Link to="/business/campaigns" className="inline-flex items-center gap-2 bg-signal-blue text-white rounded-button px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              <ArrowLeft size={16} />
              Back to Campaigns
            </Link>
          }
        />
      </div>
    );
  }

  const items = data.items as any[];

  const columns: TableColumn<any>[] = [
    {
      key: "promoter",
      header: "Promoter",
      render: (app) => (
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {app.promoter_avatar_url ? (
              <img src={app.promoter_avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <Avatar initials={app.promoter_username?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={app.id?.charCodeAt(0) || 0} />
            )}
            {app.promoter_verified && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-status flex items-center justify-center ring-2 ring-white">
                <BadgeCheck size={10} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-graphite">{app.promoter_username}</h3>
              {app.promoter_verified && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-badges text-[10px] font-medium bg-emerald-status/10 text-emerald-status">
                  <BadgeCheck size={10} />
                  Verified
                </span>
              )}
            </div>
            {app.promoter_headline && (
              <p className="text-xs text-ash mt-0.5">{app.promoter_headline}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: "stats",
      header: "Stats",
      render: (app) => (
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] text-graphite">
            <Briefcase size={10} className="text-signal-blue" />
            {app.promoter_niche}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-ash">
            <Users size={10} className="text-fog" />
            {app.promoter_followers_count?.toLocaleString()} followers
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-status font-medium">
            <TrendingUp size={10} />
            {app.promoter_engagement_rate?.toFixed(1)}% eng.
          </span>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (app) => {
        const badgeVariant =
          app.status === "PENDING"
            ? "pending"
            : app.status === "ACCEPTED"
            ? "verified"
            : app.status === "REJECTED"
            ? "rejected"
            : "draft";
        return <Badge variant={badgeVariant}>{app.status}</Badge>;
      }
    },
    ...(items.some((app: any) => app.message)
      ? [
          {
            key: "message",
            header: "Message",
            render: (app: any) =>
              app.message ? (
                <div className="max-w-[200px]">
                  <p className="text-xs text-graphite truncate" title={app.message}>
                    {app.message}
                  </p>
                </div>
              ) : (
                <span className="text-xs text-fog">-</span>
              ),
          },
        ]
      : []),
    {
      key: "actions",
      header: "Actions",
      render: (app) => (
        <div className="flex items-center gap-3">
          {app.status === "PENDING" && (
            <>
              <button
                onClick={() => handleAccept(app.id)}
                disabled={acceptMutation.isPending}
                className="bg-emerald-status/10 text-emerald-status border border-emerald-status/20 rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-emerald-status/20 transition-colors inline-flex items-center gap-1.5"
              >
                <CheckCircle2 size={12} />
                {acceptMutation.isPending ? "Accepting..." : "Accept"}
              </button>
              <button
                onClick={() => handleReject(app.id)}
                disabled={rejectMutation.isPending}
                className="bg-coral-alert/10 text-coral-alert border border-coral-alert/20 rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-coral-alert/20 transition-colors inline-flex items-center gap-1.5"
              >
                <XCircle size={12} />
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </button>
            </>
          )}
          <Link
            to={`/promoters/${app.promoter_username}`}
            className="text-xs text-signal-blue hover:underline flex items-center gap-1 font-medium ml-auto"
          >
            <Eye size={12} />
            View Profile
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/business/campaigns" className="text-xs text-signal-blue hover:underline inline-flex items-center gap-1 font-medium mb-3">
          &larr; Back to Campaigns
        </Link>
        <PageHeader
          title="Applications"
          description={`${data.total} applicant${data.total !== 1 ? 's' : ''} found for this campaign.`}
        />
      </div>

      {/* Applications List */}
      <Table columns={columns} data={items} />

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 rounded-inputs border border-slate-custom/10 px-3 py-1.5 text-xs font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors"
          >
            <ArrowLeft size={12} />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-inputs text-xs font-medium transition-colors ${
                  p === page
                    ? "bg-signal-blue text-white"
                    : "text-ash hover:bg-sky-wash"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page >= data.pages}
            className="inline-flex items-center gap-1.5 rounded-inputs border border-slate-custom/10 px-3 py-1.5 text-xs font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors"
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
