"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

export default function PromoterApplicationsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/promoter/opportunities?tab=applications");
  }, [router]);
  return <Spinner full />;
}
