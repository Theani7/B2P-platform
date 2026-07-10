"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { toast } from "react-hot-toast";
import { useMySocialLinks, useDeleteSocialLink } from "@/features/social/api";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { SocialEditor } from "@/components/social/SocialEditor";

function SocialPageInner() {
  const { data, isLoading, isError } = useMySocialLinks();
  const del = useDeleteSocialLink();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <PageHeader
        title="Social links"
        subtitle="Connect your channels to boost your profile score."
        action={!creating && <Button onClick={() => { setEditing(null); setCreating(true); }}>Add link</Button>}
      />

      {(creating || editing) && (
        <Card className="mb-6">
          <SocialEditor
            link={editing ? data?.find((l) => l.id === editing) : undefined}
            onDone={() => { setCreating(false); setEditing(null); }}
          />
        </Card>
      )}

      {isLoading && <Spinner />}
      {isError && <p className="text-body text-coral-alert">Could not load social links.</p>}
      {data && data.length === 0 && !creating && (
        <Card>
          <p className="text-body text-steel">No social links yet. Add your first channel.</p>
        </Card>
      )}

      {data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((link) => (
            <Card key={link.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-midnight-ink">{link.platform}</h3>
                {link.followersCount != null && <Badge tone="signal">{link.followersCount.toLocaleString()}</Badge>}
              </div>
              {link.username && <p className="text-caption text-steel">{link.username}</p>}
              <a href={link.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-body text-primary hover:underline">
                {link.url}
              </a>
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" onClick={() => { setCreating(false); setEditing(link.id); }}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    del.mutate(link.id, {
                      onSuccess: () => toast.success("Removed"),
                      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Delete failed"),
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

export default function SocialPage() {
  return (
    <RequireAuth role={Role.PROMOTER}>
      <SocialPageInner />
    </RequireAuth>
  );
}
