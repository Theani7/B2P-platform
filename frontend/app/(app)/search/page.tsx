"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";
import {
  useSearch,
  useSearchHistory,
  useClearSearchHistory,
  type SearchHit,
} from "@/features/search/api";

const TYPE_LABELS: Record<string, string> = {
  campaign: "Campaigns",
  promoter: "Promoters",
  business: "Businesses",
  user: "Users",
};

function Section({ title, hits }: { title: string; hits: SearchHit[] }) {
  if (hits.length === 0) return null;
  return (
    <div className="mb-5">
      <h2 className="mb-2 text-heading-sm font-semibold text-midnight-ink">{title}</h2>
      <div className="space-y-2">
        {hits.map((h) => (
          <a key={`${h.type}-${h.id}`} href={h.url}>
            <Card className="flex items-center justify-between py-3 transition hover:bg-sky-wash">
              <div>
                <p className="text-body font-medium text-midnight-ink">{h.title}</p>
                {h.subtitle && <p className="text-caption text-slate-custom">{h.subtitle}</p>}
              </div>
              <Badge tone="slate">{h.type}</Badge>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

function SearchInner() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("");
  const [active, setActive] = useState<{ q: string; type?: string } | null>(null);

  const { data, isFetching } = useSearch(
    active ? { q: active.q, type: (active.type as any) || undefined } : null,
  );
  const { data: history, refetch: refetchHistory } = useSearchHistory();
  const clearHistory = useClearSearchHistory();

  const run = () => {
    if (!q.trim()) {
      toast.error("Enter a search term");
      return;
    }
    setActive({ q, type });
    setTimeout(() => refetchHistory(), 300);
  };

  return (
    <>
      <PageHeader title="Search" subtitle="Find campaigns, promoters, businesses, and users." />

      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none focus:border-primary"
          >
            <option value="">All</option>
            <option value="campaign">Campaigns</option>
            <option value="promoter">Promoters</option>
            <option value="business">Businesses</option>
            <option value="user">Users</option>
          </select>
          <Button onClick={run} disabled={isFetching}>
            {isFetching ? "Searching…" : "Search"}
          </Button>
        </div>

        {history && history.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-caption uppercase tracking-wide text-steel">Recent:</span>
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setQ(h.query);
                  setActive({ q: h.query, type });
                }}
                className="rounded-pill bg-steel/10 px-3 py-1 text-caption text-graphite hover:bg-steel/20"
              >
                {h.query}
              </button>
            ))}
            <button
              onClick={() =>
                clearHistory.mutate(undefined, {
                  onSuccess: () => {
                    toast.success("History cleared");
                    refetchHistory();
                  },
                })
              }
              className="text-caption text-coral-alert hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </Card>

      {active && isFetching && <Spinner />}
      {data && (
        <>
          <Section title={TYPE_LABELS.campaign} hits={data.campaigns} />
          <Section title={TYPE_LABELS.promoter} hits={data.promoters} />
          <Section title={TYPE_LABELS.business} hits={data.businesses} />
          <Section title={TYPE_LABELS.user} hits={data.users} />
          {Object.values(data).every((arr: any) => arr.length === 0) && (
            <Card>
              <p className="text-body text-slate-custom">No results found.</p>
            </Card>
          )}
        </>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <RequireAuth>
      <SearchInner />
    </RequireAuth>
  );
}
