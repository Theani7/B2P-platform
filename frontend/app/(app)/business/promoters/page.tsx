"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Spinner } from "@/components/ui/Spinner";
import { useSavedPromoters } from "@/features/discovery/api";
import { PromoterDirectoryList } from "@/components/discovery/PromoterDirectoryList";
import { SavedPromotersList } from "@/components/discovery/SavedPromotersList";
import { Users, BookmarkSimple } from "@phosphor-icons/react";

type Tab = "discover" | "saved";

function PromotersInner() {
  const params = useSearchParams();
  const initial = params.get("tab") === "saved" ? "saved" : "discover";
  const [tab, setTab] = useState<Tab>(initial);
  const { data: savedData } = useSavedPromoters({ limit: 1 });
  const savedTotal = savedData?.total ?? 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 120% at 100% 0%, rgba(182,203,253,0.5) 0%, rgba(240,244,254,0) 60%)" }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-midnight-ink">
              Promoters
            </h1>
            <p className="text-sm text-ash mt-2">
              Discover verified creators, explore portfolios, and invite top talent to your campaigns.
            </p>
          </div>

          <div className="inline-flex gap-1 rounded-pill bg-sky-wash/70 p-1 w-fit self-start sm:self-auto">
            <button
              onClick={() => setTab("discover")}
              className={`flex items-center gap-2 rounded-pill px-5 py-2 text-sm font-semibold transition-all ${
                tab === "discover" ? "bg-white text-graphite shadow-product-card" : "text-ash hover:text-graphite"
              }`}
            >
              <Users size={16} weight="bold" />
              <span>Discover</span>
            </button>
            <button
              onClick={() => setTab("saved")}
              className={`flex items-center gap-2 rounded-pill px-5 py-2 text-sm font-semibold transition-all ${
                tab === "saved" ? "bg-white text-graphite shadow-product-card" : "text-ash hover:text-graphite"
              }`}
            >
              <BookmarkSimple size={16} weight="bold" />
              <span>Saved</span>
              {savedTotal > 0 && (
                <span className="bg-sky-wash text-signal-blue text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {savedTotal > 99 ? "99+" : savedTotal}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {tab === "discover" ? <PromoterDirectoryList /> : <SavedPromotersList />}
    </div>
  );
}

export default function PromoterDirectoryPage() {
  return (
    <RequireAuth role={Role.BUSINESS}>
      <Suspense fallback={<Spinner full />}>
        <PromotersInner />
      </Suspense>
    </RequireAuth>
  );
}
