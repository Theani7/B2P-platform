"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Spinner } from "@/components/ui/Spinner";
import { useSavedPromoters } from "@/features/discovery/api";
import { PromoterDirectoryList } from "@/components/discovery/PromoterDirectoryList";
import { SavedPromotersList } from "@/components/discovery/SavedPromotersList";
import { Users, Bookmark } from "lucide-react";

type Tab = "discover" | "saved";

function PromotersInner() {
  const params = useSearchParams();
  const initial = params.get("tab") === "saved" ? "saved" : "discover";
  const [tab, setTab] = useState<Tab>(initial);
  const { data: savedData } = useSavedPromoters({ limit: 1 });
  const savedTotal = savedData?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="inline-flex gap-1 rounded-pill bg-sky-wash/70 p-1 w-fit">
        <button
          onClick={() => setTab("discover")}
          className={`flex items-center gap-2 rounded-pill px-5 py-2 text-sm font-semibold transition-all ${
            tab === "discover" ? "bg-white text-graphite shadow-product-card" : "text-ash hover:text-graphite"
          }`}
        >
          <Users size={15} />
          Discover
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`flex items-center gap-2 rounded-pill px-5 py-2 text-sm font-semibold transition-all ${
            tab === "saved" ? "bg-white text-graphite shadow-product-card" : "text-ash hover:text-graphite"
          }`}
        >
          <Bookmark size={15} />
          Saved
          {savedTotal > 0 && (
            <span className="bg-sky-wash text-signal-blue text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {savedTotal > 99 ? "99+" : savedTotal}
            </span>
          )}
        </button>
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
