"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Spinner } from "@/components/ui/Spinner";
import { usePromoterInvitations } from "@/features/invitations/api";
import { useMyApplications } from "@/features/applications/api";
import { InvitationsInner } from "@/components/promoter/InvitationsList";
import { ApplicationsInner } from "@/components/promoter/ApplicationsList";
import { Inbox, Send } from "lucide-react";

type Tab = "invitations" | "applications";

function OpportunitiesInner() {
  const params = useSearchParams();
  const initial = params.get("tab") === "applications" ? "applications" : "invitations";
  const [tab, setTab] = useState<Tab>(initial);

  const { data: invs } = usePromoterInvitations({ status: "PENDING", limit: 1 });
  const { data: apps } = useMyApplications({ page: 1, limit: 1 });
  const pendingInvites = invs?.total ?? 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-5 rounded-cards-lg border border-steel/10 bg-white p-5 shadow-product-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-midnight-ink">Opportunities</h1>
          <p className="text-sm text-ash mt-1.5">Brand invitations needing your answer, and applications awaiting theirs.</p>
        </div>
        <div className="inline-flex w-fit gap-1 rounded-pill bg-sky-wash/70 p-1">
          <button
            onClick={() => setTab("invitations")}
            className={`flex items-center gap-2 rounded-pill px-5 py-2 text-sm font-semibold transition-all ${
              tab === "invitations" ? "bg-white text-graphite shadow-product-card" : "text-ash hover:text-graphite"
            }`}
          >
            <Inbox size={15} />
            Invitations
            {pendingInvites > 0 && (
              <span className="bg-coral-alert text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {pendingInvites > 99 ? "99+" : pendingInvites}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("applications")}
            className={`flex items-center gap-2 rounded-pill px-5 py-2 text-sm font-semibold transition-all ${
              tab === "applications" ? "bg-white text-graphite shadow-product-card" : "text-ash hover:text-graphite"
            }`}
          >
            <Send size={15} />
            My Applications
            {(apps?.total ?? 0) > 0 && (
              <span className="bg-sky-wash text-signal-blue text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {apps!.total > 99 ? "99+" : apps!.total}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === "invitations" ? <InvitationsInner /> : <ApplicationsInner />}
    </div>
  );
}

export default function PromoterOpportunitiesPage() {
  return (
    <RequireAuth role={Role.PROMOTER}>
      <Suspense fallback={<Spinner full />}>
        <OpportunitiesInner />
      </Suspense>
    </RequireAuth>
  );
}
