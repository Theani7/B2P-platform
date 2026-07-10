"use client";

"use use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { toast } from "react-hot-toast";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { useBusinessApplications, useAcceptApplication, useRejectApplication } from "@/features/applications/api";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Users, TrendingUp, Briefcase, Eye, BadgeCheck, Star,
} from "lucide-react";

function ApplicationsPageInner() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const { data, isLoading, error } = useBusinessApplications({ page, limit: 20 });
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();
  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-cards bg-coral-alert/10 flex items-center justify-center mb-4">
        <Eye size={32} className="text-coral-alert" />
      </div>
      <p className="text-lg font-medium text-graphite">Error loading applications</p>
      <p className="text-sm text-ash mt-1">{(error as Error).message}</p>
    </div>
  );

  const handleAccept = (id: string) => {
    acceptMutation.mutate(id, {
      onSuccess: () => { toast.success("Application accepted — collaboration created!"); setSelectedAppId(null); },
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
    });
  };

  const confirmReject = () => {
    if (!rejectConfirm) return;
    rejectMutation.mutate(rejectConfirm, {
      onSuccess: () => { toast.success("Application rejected"); setRejectConfirm(null); setSelectedAppId(null); },
      onError: (e: any) => { toast.error(e?.response?.data?.message ?? "Failed"); setRejectConfirm(null); },
    });
  };

  const items = data?.items || [];
  const selectedApp = items.find((app) => app.id === selectedAppId);
  const fmtCompact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `${n}`);

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => router.push("/business/campaigns")} className="text-xs text-signal-blue hover:underline inline-flex items-center gap-1 font-medium mb-3">
          &larr; Back to Campaigns
        </button>
        <PageHeader
          title="Applications"
          subtitle={`${data?.total ?? 0} applicant${(data?.total ?? 0) !== 1 ? "s" : ""} found for your campaigns.`}
        />
      </div>

      {isLoading && <Spinner />}
      {!isLoading && items.length === 0 && (
        <EmptyState
          title="No applications yet"
          description="Promoters haven't applied to your campaigns yet. Try promoting them more or inviting specific promoters."
          action={
            <button onClick={() => router.push("/business/campaigns")} className="inline-flex items-center gap-2 bg-signal-blue text-white rounded-button px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              <ArrowLeft size={16} /> Back to Campaigns
            </button>
          }
        />
      )}

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((app: any) => (
            <div key={app.id} className="bg-white border border-slate-custom/10 rounded-cards p-5 shadow-product-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {app.promoterProfile?.avatarUrl ? (
                      <img src={app.promoterProfile.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <Avatar initials={app.promoterProfile?.username?.[0]?.toUpperCase() ?? "?"} size="md" colorIndex={app.id?.charCodeAt(0) || 0} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <a href={`/promoters/${app.promoterProfile?.username}`} className="text-sm font-medium text-graphite hover:text-signal-blue">
                        {app.promoterProfile?.username}
                      </a>
                    </div>
                    {app.promoterProfile?.headline && <p className="text-xs text-ash mt-0.5">{app.promoterProfile.headline}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 lg:items-end">
                  {app.promoterProfile?.niche && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-graphite">
                      <Briefcase size={10} className="text-signal-blue" /> {app.promoterProfile.niche}
                    </span>
                  )}
                  {app.campaign?.title && (
                    <span className="text-xs text-ash">Campaign: {app.campaign.title}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Badge tone={app.status === "ACCEPTED" ? "emerald" : app.status === "REJECTED" ? "coral" : "slate"}>{app.status}</Badge>
                  <button
                    onClick={() => setSelectedAppId(app.id)}
                    className="text-xs text-signal-blue hover:underline flex items-center gap-1 font-medium"
                  >
                    <Eye size={14} /> View
                  </button>
                </div>
              </div>
              {app.message && (
                <div className="mt-3 bg-linen-canvas/50 border border-slate-custom/10 rounded-xl p-3">
                  <p className="text-xs italic text-graphite">"{app.message}"</p>
                </div>
              )}
            </div>
          ))}

          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex items-center gap-1.5 rounded-inputs border border-slate-custom/10 px-3 py-1.5 text-xs font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">
                <ArrowLeft size={12} /> Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-inputs text-xs font-medium transition-colors ${p === page ? "bg-signal-blue text-white" : "text-ash hover:bg-sky-wash"}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="inline-flex items-center gap-1.5 rounded-inputs border border-slate-custom/10 px-3 py-1.5 text-xs font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">
                Next <ArrowLeft size={12} className="rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-cards p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-4">
              {selectedApp.promoterProfile?.avatarUrl ? (
                <img src={selectedApp.promoterProfile.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-slate-custom/5" />
              ) : (
                <Avatar initials={selectedApp.promoterProfile?.username?.[0]?.toUpperCase() ?? "?"} size="lg" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-graphite">{selectedApp.promoterProfile?.username}</h3>
                </div>
                <p className="text-sm text-ash">{selectedApp.promoterProfile?.headline}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedApp.promoterProfile?.niche && (
                    <span className="text-xs font-bold text-fog uppercase tracking-wide">{selectedApp.promoterProfile.niche}</span>
                  )}
                  {selectedApp.campaign?.title && (
                    <>
                      <span className="text-xs text-ash">•</span>
                      <span className="text-xs text-graphite font-medium">{selectedApp.campaign.title}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-linen-canvas/50 border border-slate-custom/10 rounded-xl p-5 mt-4">
              <h4 className="text-xs font-bold text-ash uppercase tracking-wider mb-2">Message to Business</h4>
              {selectedApp.message ? (
                <p className="text-sm text-graphite leading-relaxed whitespace-pre-wrap italic">"{selectedApp.message}"</p>
              ) : (
                <p className="text-sm text-ash italic">No message provided.</p>
              )}
            </div>

            {selectedApp.status === "PENDING" && (
              <div className="flex items-center justify-end gap-3 mt-6">
                <Button variant="danger" onClick={() => setRejectConfirm(selectedApp.id)} disabled={rejectMutation.isPending}>
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </Button>
                <Button onClick={() => handleAccept(selectedApp.id)} disabled={acceptMutation.isPending}>
                  {acceptMutation.isPending ? "Accepting..." : "Accept Application"}
                </Button>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => setSelectedAppId(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {rejectConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-cards p-6 max-w-md w-full shadow-xl">
            <h3 className="text-heading font-bold text-graphite">Reject Application</h3>
            <p className="text-sm text-ash mt-2">Are you sure you want to reject this application? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setRejectConfirm(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmReject}>Reject</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusinessApplicationsPage() {
  return (
    <RequireAuth role={Role.BUSINESS}>
      <ApplicationsPageInner />
    </RequireAuth>
  );
}
