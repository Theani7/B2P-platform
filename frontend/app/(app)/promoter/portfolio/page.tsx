"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useMyPortfolio, useDeletePortfolioItem } from "@/features/portfolio/api";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PortfolioEditor } from "@/components/portfolio/PortfolioEditor";

function PortfolioPageInner() {
  const { data, isLoading, isError } = useMyPortfolio();
  const del = useDeletePortfolioItem();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle="Showcase your best work to brands."
        action={
          !creating && (
            <Button onClick={() => { setEditing(null); setCreating(true); }}>Add item</Button>
          )
        }
      />

      {(creating || editing) && (
        <Card className="mb-6">
          <PortfolioEditor
            item={editing ? data?.find((i) => i.id === editing) : undefined}
            onDone={() => { setCreating(false); setEditing(null); }}
          />
        </Card>
      )}

      {isLoading && <Spinner />}
      {isError && <p className="text-body text-coral-alert">Could not load portfolio.</p>}
      {data && data.length === 0 && !creating && (
        <Card>
          <p className="text-body text-steel">No portfolio items yet. Add your first piece of work.</p>
        </Card>
      )}

      {data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <Card key={item.id}>
              {(item.media ?? []).length > 0 && (
                <div className="mb-3 grid grid-cols-2 gap-1">
                  {(item.media ?? []).slice(0, 4).map((m) => (
                    <img key={m.id} src={m.filePath} alt={item.title} className="h-24 w-full rounded-images object-cover" />
                  ))}
                  {(item.media ?? []).length > 4 && (
                    <div className="flex h-24 items-center justify-center rounded-images bg-steel/10 text-caption text-steel">
                      +{(item.media ?? []).length - 4}
                    </div>
                  )}
                </div>
              )}
              {!item.media?.length && item.coverImage && (
                <img src={item.coverImage} alt={item.title} className="mb-3 h-32 w-full rounded-images object-cover" />
              )}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-midnight-ink">{item.title}</h3>
                {item.featured && <Badge tone="amber">Featured</Badge>}
              </div>
              {item.campaignType && <p className="text-caption text-steel">{item.campaignType}</p>}
              {item.description && <p className="mt-1 text-body text-slate-custom line-clamp-3">{item.description}</p>}
              {item.platforms && item.platforms.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.platforms.map((p) => (
                    <Badge key={p}>{p}</Badge>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" onClick={() => { setCreating(false); setEditing(item.id); }}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    del.mutate(item.id, {
                      onSuccess: () => notifySuccess("Deleted"),
                      onError: (e: any) => notifyError(e?.response?.data?.message ?? "Delete failed"),
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <RequireAuth role={Role.PROMOTER}>
      <PortfolioPageInner />
    </RequireAuth>
  );
}
