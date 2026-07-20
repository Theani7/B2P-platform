"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { notifySuccess, notifyError } from "@/lib/notify";
import { resendVerification } from "@/features/auth/api";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";

function VerifySentInner() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  const resend = async () => {
    if (cooldown > 0 || !email) return;
    setSending(true);
    try {
      await resendVerification({ email });
      setCooldown(30);
      notifySuccess("Verification email resent.");
    } catch {
      notifyError("Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10 text-center sm:text-left">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-cardlarge bg-signal-blue/10 text-signal-blue">
          <Mail className="h-6 w-6" />
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-graphite mb-2">Check your inbox</h1>
        <p className="text-sm text-ash font-medium">
          We sent a verification link{email ? ` to ${email}` : ""}. Click it to activate your account.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-cards border border-sky-wash bg-sky-wash/60 p-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-signal-blue" />
        <p className="text-caption text-slate-custom font-medium leading-relaxed">
          You must verify your email before signing in. If you don't see it within a few minutes, check your spam folder.
        </p>
      </div>

      <div className="mt-6 text-center">
        {cooldown > 0 ? (
          <span className="text-caption text-steel">Resend in {cooldown}s</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={sending}
            className="text-xs font-semibold text-signal-blue hover:text-signal-blue/80 transition-colors disabled:opacity-60"
          >
            Didn't get it? Resend email
          </button>
        )}
      </div>

      <p className="mt-8 text-center text-sm font-medium text-ash">
        <Link href="/login" className="inline-flex items-center justify-center gap-1.5 text-signal-blue hover:text-signal-blue/80 font-bold transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense fallback={null}>
      <VerifySentInner />
    </Suspense>
  );
}
