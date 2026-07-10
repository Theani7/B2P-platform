"use client";

"use use client";

import { useState } from "react";
import { use } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ShareDialog } from "@/components/sharing/ShareDialog";
import {
  useCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  usePublishCampaign,
  useUnpublishCampaign,
  useArchiveCampaign,
  useReopenCampaign,
} from "@/features/campaigns/api";
import { CampaignStatus, type CampaignUpdatePayload } from "@/features/campaigns/types";
import { StatusBadge, formatBudget } from "@/components/campaigns/StatusBadge";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useCampaignApplications, useAcceptApplication, useRejectApplication } from "@/features/applications/api";
import { useBusinessInvitations, useInvitePromoter, useCancelInvitation } from "@/features/invitations/api";
import api from "@/lib/apiClient";
import { Rocket } from "lucide-react";

function ApplicantRow({ app }: { app: any }) {
  const accept = useAcceptApplication();
  const reject = useRejectApplication();
  return (
    <div className="flex items-center justify-between gap-3 border-t border-steel/10 py-3">
      <div>
        <a href={`/promoters/${app.promoterProfile?.username}`} className="font-medium text-midnight-ink hover:text-primary">
          @{app.promoterProfile?.username}
        </a>
        <p className="text-caption text-steel">
          {app.promoterProfile?.niche}
          {app.message ? ` · "${app.message}"` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={app.status === "ACCEPTED" ? "emerald" : app.status === "REJECTED" ? "coral" : "slate"}>{app.status}</Badge>
        {app.status === "PENDING" && (
          <>
            <Button onClick={() => accept.mutate(app.id, { onError: (e: any) => toast.error(e?.response?.data?.message) })}>Accept</Button>
            <Button variant="danger" onClick={() => reject.mutate(app.id, { onError: (e: any) => toast.error(e?.response?.data?.message) })}>Reject</Button>
          </>
        )}
      </div>
    </div>
  );
}

function InvitePanel({ campaignId }: { campaignId: string }) {
  const [username, setUsername] = useState("");
  const invite = useInvitePromoter();
  const [busy, setBusy] = useState(false);

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setBusy(true);
    try {
      const { data: promoter } = await api.get(`/promoters/${username.trim()}`);
      invite.mutate(
        { campaignId, promoterId: promoter.id, message: "" },
        {
          onSuccess: () => { toast.success(`Invited @${username}`); setUsername(""); },
          onError: (e: any) => toast.error(e?.response?.data?.message ?? "Invite failed"),
        },
      );
    } catch {
      toast.error("Promoter not found");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mt-6">
      <h2 className="mb-3 text-heading text-graphite pb-2 border-b border-slate-custom/10">Invite a promoter</h2>
      <form className="flex gap-2" onSubmit={onInvite}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Promoter username"
          className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Button type="submit" disabled={busy}>Invite</Button>
      </form>
    </Card>
  );
}

function CampaignDetailInner({ id }: { id: string }) {
  const router = useRouter();
  const { data: campaign, isLoading, isError } = useCampaign(id);
  const update = useUpdateCampaign();
  const del = useDeleteCampaign();
  const publish = usePublishCampaign();
  const unpublish = useUnpublishCampaign();
  const archive = useArchiveCampaign();
  const reopen = useReopenCampaign();
  const [editing, setEditing] = useState(false);
  const [share, setShare] = useState(false);
  const { data: apps } = useCampaignApplications(id);
  const { data: invites } = useBusinessInvitations();
  const cancelInvite = useCancelInvitation();

  if (isLoading) return <Spinner />;
  if (isError || !campaign) return <p className="text-body text-coral-alert">Could not load this campaign.</p>;

  const run = (m: { mutate: (id: string, o?: any) => void }, msg: string) =>
    m.mutate(id, {
      onSuccess: () => toast.success(msg),
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Action failed"),
    });

  const onDelete = () => {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    del.mutate(id, {
      onSuccess: () => { toast.success("Campaign deleted"); router.push("/business/campaigns"); },
      onError: (e: any) => toast.error(e?.response?.data?.message),
    });
  };

  const onUpdate = (data: CampaignUpdatePayload) =>
    update.mutate({ id, data }, {
      onSuccess: () => { toast.success("Saved"); setEditing(false); },
      onError: (e: any) => toast.error(e?.response?.data?.message),
    });

  const campaignInvites = invites?.items.filter((i) => i.campaign?.id === id) ?? [];
  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.push("/business/campaigns")}
          className="text-xs text-signal-blue hover:underline inline-flex items-center gap-1 font-medium mb-3"
        >
          &larr; Back to Campaigns
        </button>
        <PageHeader
          title={campaign.title}
          subtitle="View campaign details, requirements, timeline and promoter applications."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={campaign.status} />
              <button
                onClick={() => setEditing(!editing)}
                className="bg-white border border-slate-custom/10 text-graphite rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-sky-wash transition-colors"
              >
                {editing ? "Cancel Edit" : "Edit"}
              </button>
              {campaign.status === CampaignStatus.DRAFT && (
                <button
                  onClick={() => run(publish, "Published")}
                  className="bg-signal-blue text-white border border-signal-blue rounded-inputs px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-colors flex items-center gap-1.5"
                >
                  <Rocket size={14} /> Publish
                </button>
              )}
              {campaign.status === CampaignStatus.OPEN && (
                <button onClick={() => run(unpublish, "Unpublished")} className="bg-amber-tag/10 text-amber-tag border border-amber-tag/20 rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-amber-tag/20 transition-colors">
                  Unpublish
                </button>
              )}
              {campaign.status !== CampaignStatus.ARCHIVED && (
                <button onClick={() => run(archive, "Archived")} className="bg-amber-tag/10 text-amber-tag border border-amber-tag/20 rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-amber-tag/20 transition-colors">
                  Archive
                </button>
              )}
              {campaign.status === CampaignStatus.ARCHIVED && (
                <button onClick={() => run(reopen, "Reopened")} className="bg-emerald-status/10 text-emerald-status border border-emerald-status/20 rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-emerald-status/20 transition-colors">
                  Reopen
                </button>
              )}
              <button onClick={() => setShare(true)} className="bg-white border border-slate-custom/10 text-graphite rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-sky-wash transition-colors">
                Share
              </button>
              <button onClick={onDelete} className="bg-coral-alert/10 text-coral-alert border border-coral-alert/20 rounded-inputs px-3 py-1.5 text-xs font-medium hover:bg-coral-alert/20 transition-colors">
                Delete
              </button>
            </div>
          }
        />
      </div>

      {editing ? (
        <Card>
          <CampaignForm campaign={campaign} submitting={update.isPending} onSubmit={onUpdate} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  <p className="mt-0.5 text-sm font-medium text-graphite">{formatBudget(campaign.budget)}</p>
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
              {campaign.targetAudience && (
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Target Audience</span>
                  <p className="mt-1 text-sm text-graphite leading-relaxed">{campaign.targetAudience}</p>
                </div>
              )}
              {campaign.requirements && (
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Requirements</span>
                  <p className="mt-1 text-sm text-graphite leading-relaxed">{campaign.requirements}</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-custom/10 rounded-cards p-5 space-y-4">
              <h2 className="text-heading text-graphite pb-2 border-b border-slate-custom/10">Timeline</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Start Date</span>
                  <p className="mt-0.5 text-sm font-medium text-graphite">{fmtDate(campaign.startDate)}</p>
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-fog">End Date</span>
                  <p className="mt-0.5 text-sm font-medium text-graphite">{fmtDate(campaign.endDate)}</p>
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Created</span>
                  <p className="mt-0.5 text-sm font-medium text-graphite">{fmtDate(campaign.createdAt)}</p>
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-fog">Last Updated</span>
                  <p className="mt-0.5 text-sm font-medium text-graphite">{fmtDate(campaign.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-custom/10 rounded-cards p-5 space-y-4">
            <h2 className="text-heading text-graphite pb-2 border-b border-slate-custom/10">Promoter Matching</h2>
            <div className="flex gap-3">
              <a href={`/business/campaigns/${campaign.id}/matches`} className="bg-signal-blue text-white rounded-button px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                Recommended Promoters
              </a>
              <a href={`/business/campaigns/${campaign.id}`} className="bg-white border border-slate-custom/10 text-graphite rounded-inputs px-4 py-2 text-sm font-medium hover:bg-sky-wash transition-colors">
                View Applications
              </a>
            </div>
          </div>
        </>
      )}

      <Card>
        <h2 className="mb-3 text-heading text-graphite pb-2 border-b border-slate-custom/10">Applications</h2>
        {!apps || apps.items.length === 0 ? (
          <p className="text-body text-steel">No applications yet.</p>
        ) : (
          <div>
            {apps.items.map((a) => (
              <ApplicantRow key={a.id} app={a} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-heading text-graphite pb-2 border-b border-slate-custom/10">Invitations</h2>
        {campaignInvites.length === 0 ? (
          <p className="text-body text-steel">No invitations sent for this campaign.</p>
        ) : (
          <div>
            {campaignInvites.map((i) => (
              <div key={i.id} className="flex items-center justify-between border-t border-steel/10 py-3">
                <div>
                  <a href={`/promoters/${i.promoterProfile?.username}`} className="font-medium text-midnight-ink hover:text-primary">@{i.promoterProfile?.username}</a>
                  <Badge tone={i.status === "ACCEPTED" ? "emerald" : i.status === "REJECTED" ? "coral" : "slate"}>{i.status}</Badge>
                </div>
                {i.status === "PENDING" && (
                  <Button variant="ghost" onClick={() => cancelInvite.mutate(i.id, { onError: (e: any) => toast.error(e?.response?.data?.message) })}>Cancel</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <InvitePanel campaignId={id} />
      <ShareDialog campaignId={id} open={share} onClose={() => setShare(false)} />
    </div>
  );
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireAuth role={Role.BUSINESS}>
      <CampaignDetailInner id={id} />
    </RequireAuth>
  );
}
