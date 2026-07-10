"use client";

import { useProfileCompletion } from "@/features/profile-completion/api";
import { Card } from "@/components/ui/Card";

export function ProfileCompletionWidget() {
  const { data, isLoading } = useProfileCompletion();

  if (isLoading) return null;
  if (!data) return null;

  const pct = data.completion;
  const tone = pct >= 80 ? "bg-emerald-status" : pct >= 40 ? "bg-amber-tag" : "bg-coral-alert";

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-heading-sm font-semibold text-midnight-ink">Profile completion</h2>
        <span className="font-mono text-heading-sm font-semibold text-primary">{pct}%</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-steel/15">
        <div className={`h-full rounded-pill ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      {data.missing.length > 0 ? (
        <p className="mt-3 text-caption text-steel">
          Complete these to reach 100%: {data.missing.join(", ")}.
        </p>
      ) : (
        <p className="mt-3 text-caption text-emerald-status">Your profile is complete.</p>
      )}
    </Card>
  );
}
