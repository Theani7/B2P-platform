"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

export default function SavedPromotersPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/business/promoters?tab=saved");
  }, [router]);
  return <Spinner full />;
}
