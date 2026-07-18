"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/apiClient";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    api
      .post("/auth/verify-email", { token })
      .then(() => setStatus("ok"))
      .catch((e) => {
        setStatus("error");
        setMessage(e?.response?.data?.message || "Verification failed.");
      });
  }, [token]);

  return (
    <AuthLayout>
      <div className="text-center">
        {status === "loading" && <Spinner />}
        {status === "ok" && (
          <>
            <h1 className="text-heading font-semibold text-midnight-ink">Email verified</h1>
            <p className="mt-2 text-body text-slate-custom">
              Your email is confirmed. You can now use your account.
            </p>
            <Link href="/login" className="mt-4 inline-block">
              <Button>Sign in</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-heading font-semibold text-coral-alert">Could not verify</h1>
            <p className="mt-2 text-body text-slate-custom">{message}</p>
            <Link href="/login" className="mt-4 inline-block">
              <Button variant="ghost">Back to login</Button>
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Spinner full />}>
      <VerifyInner />
    </Suspense>
  );
}
