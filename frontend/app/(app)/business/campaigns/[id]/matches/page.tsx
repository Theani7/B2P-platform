"use client";

import { use, useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useMatches, useGenerateMatches, type MatchClassification, type MatchScoreBreakdown } from "@/features/matching/api";
import { useInvitePromoter } from "@/features/invitations/api";

const classTone: Record<MatchClassification, "emerald" | "signal" | "amber" | "coral"> = {
  EXCELLENT_MATCH: "emerald",
  GOOD_MATCH: "signal",
  AVERAGE_MATCH: "amber",
  LOW_MATCH: "coral",
};

const CLASSES: (MatchClassification | "")[] = ["", "EXCELLENT_MATCH", "GOOD_MATCH", "AVERAGE_MATCH", "LOW_MATCH"];

const BREAKDOWN_LABELS: Record<string, string> = {
  niche: "Niche fit",
  location: "Location",
  followers: "Followers",
  experience: "Experience",
  engagement: "Engagement",
};

function MatchBreakdown({ breakdown }: { breakdown?: MatchScoreBreakdown }) {
  if (!breakdown) return null;
  const entries = Object.entries(breakdown).map(([k, v]) => ({ k, v: v as number })).filter((e) => typeof e.v === "number");
  const max = Math.max(15, ...entries.map((e) => e.v || 0));
  return (
    <Card className="border border-steel/10">
      <h2 className="mb-3 font-display text-lg font-medium tracking-tight text-graphite">Score Breakdown</h2>
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.k}>
            <div className="flex items-center justify-between text-caption text-steel">
              <span className="font-medium">{BREAKDOWN_LABELS[e.k] ?? e.k}</span>
              <span className="font-mono">{e.v}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-pill bg-steel/15">
              <div className="h-full rounded-pill bg-signal-blue" style={{ width: `${Math.round((e.v / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MatchesInner({ id }: { id: string }) {
  const [classification, setClassification] = useState<string>("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useMatches(id, {
    classification: (classification || undefined) as MatchClassification | undefined,
    page,
    limit: 12,
  });
  const generate = useGenerateMatches();
  const invite = useInvitePromoter();

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 120% at 100% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0) 60%)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-midnight-ink">Matches</h1>
            <p className="text-sm text-ash mt-2">AI-scored promoters for this campaign.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/business/campaigns/${id}`}
              className="inline-flex items-center justify-center h-11 px-5 rounded-pill bg-white border border-slate-custom/15 text-sm font-semibold text-graphite hover:border-signal-blue/40 hover:text-signal-blue transition-all shadow-sm"
            >
              Back to campaign
            </a>
            <button
              disabled={generate.isPending}
              onClick={() =>
                generate.mutate(id, {
                  onSuccess: (d) => notifySuccess(`Generated ${d.totalMatches} matches`),
                  onError: (e: any) => notifyError(e?.response?.data?.message ?? "Could not generate"),
                })
              }
              className="inline-flex items-center justify-center h-11 px-5 rounded-pill bg-signal-blue text-white text-sm font-semibold hover:opacity-90 transition-all shadow-product-card disabled:cursor-not-allowed disabled:opacity-60"
            >
              Generate matches
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-[1.75rem] border border-slate-custom/10 bg-white p-2.5 shadow-feature-section">
        {CLASSES.map((c) => (
          <button
            key={c || "all"}
            onClick={() => { setClassification(c); setPage(1); }}
            className={`rounded-pill px-4 py-2 text-xs font-bold transition-colors ${classification === c ? "bg-midnight-ink text-white shadow-product-card" : "text-ash hover:text-graphite hover:bg-sky-wash"}`}
          >
            {c ? c.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {isError && <p className="text-body text-coral-alert">Could not load matches.</p>}
      {data && data.items.length === 0 && (
        <Card className="border border-steel/10"><p className="text-body text-steel">No matches yet. Click “Generate matches”.</p></Card>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {data.items.map((m) => (
                <Card key={m.id} className="border border-steel/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal-blue/30 hover:shadow-elevated">
                  <div className="flex items-start justify-between gap-2">
                    <a href={`/u/${m.promoter.username}`} className="font-medium text-midnight-ink hover:text-primary">
                      @{m.promoter.username}
                    </a>
                    <span className="font-mono text-heading-sm font-semibold text-primary">{Math.round(m.score)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge tone={classTone[m.classification]}>{m.classification.replace("_", " ")}</Badge>
                    {m.promoter.verified && <Badge tone="emerald">Verified</Badge>}
                    <Badge tone="signal">{m.promoter.niche}</Badge>
                  </div>
                  <p className="mt-2 text-caption text-steel">{m.explanation}</p>
                  <div className="mt-3 flex items-center gap-3 border-t border-steel/10 pt-2 text-caption text-steel">
                    <span>{m.promoter.followersCount.toLocaleString()} followers</span>
                    <span>{m.promoter.engagementRate}% eng.</span>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="subtle"
                      onClick={() =>
                        invite.mutate(
                          { campaignId: id, promoterId: m.promoter.id },
                          {
                            onSuccess: () => notifySuccess(`Invited @${m.promoter.username}`),
                            onError: (e: any) => notifyError(e?.response?.data?.message ?? "Invite failed"),
                          },
                        )
                      }
                    >
                      Invite
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <MatchBreakdown breakdown={data.items[0]?.scoreBreakdown} />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-caption text-steel">{data.total} · Page {data.page} of {data.pages}</span>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="ghost" disabled={data.page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CampaignMatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireAuth role={Role.BUSINESS}>
      <MatchesInner id={id} />
    </RequireAuth>
  );
}
