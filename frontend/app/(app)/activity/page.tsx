"use client";

import { RequireAuth } from "@/components/common/RequireAuth";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useMyActivities, useBusinessActivities, useAdminActivities } from "@/features/activity/api";
import { useAuth } from "@/providers/AuthProvider";
import { Role } from "@/lib/roles";

function ActivityInner() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;
  const isBusiness = user?.role === Role.BUSINESS;

  const { data, isLoading } = isAdmin
    ? useAdminActivities()
    : isBusiness
      ? useBusinessActivities()
      : useMyActivities();

  if (isLoading) return <Spinner />;

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader title="Activity" subtitle="A log of actions across the platform." />
      {items.length === 0 ? (
        <Card>
          <p className="text-body text-slate-custom">No activity recorded yet.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((log) => (
            <Card key={log.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-body font-medium text-midnight-ink">{log.title}</p>
                {log.description && (
                  <p className="text-caption text-slate-custom">{log.description}</p>
                )}
                <p className="mt-1 text-caption text-steel">
                  {log.actorName ? `${log.actorName} · ` : ""}
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge tone="slate">{log.action}</Badge>
                {log.entityType && <Badge tone="signal">{log.entityType}</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default function ActivityPage() {
  return (
    <RequireAuth>
      <ActivityInner />
    </RequireAuth>
  );
}
