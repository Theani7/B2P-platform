"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

export default function PromoterInvitationsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/promoter/opportunities?tab=invitations");
  }, [router]);
  return <Spinner full />;
}
