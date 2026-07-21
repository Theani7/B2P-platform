"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { notifySuccess, notifyError } from "@/lib/notify";
import { verifyRegistrationOtp, resendRegistrationOtp } from "@/features/auth/api";
import { OtpInput } from "@/components/ui/OtpInput";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";

function VerifyOtpInner() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") || "";
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const resend = async () => {
    if (cooldown > 0 || !email) return;
    setResending(true);
    try {
      await resendRegistrationOtp({ email });
      setCooldown(30);
      notifySuccess("A new code was sent.");
    } catch {
      notifyError("Something went wrong.");
    } finally {
      setResending(false);
    }
  };

  const submit = async () => {
    if (code.length !== 6) {
      notifyError("Enter the 6-digit code.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await verifyRegistrationOtp({ email, code });
      notifySuccess("Email verified. Welcome!");
      window.location.href = `/${user.role.toLowerCase()}/profile`;
    } catch {
      notifyError("Invalid or expired code.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10 text-center sm:text-left">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-cardlarge bg-signal-blue/10 text-signal-blue">
          <KeyRound className="h-6 w-6" />
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-graphite mb-2">Verify your email</h1>
        <p className="text-sm text-ash font-medium">
          We sent a 6-digit code{email ? ` to ${email}` : ""}. Enter it to activate your account.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
        <OtpInput length={6} value={code} onChange={setCode} autoFocus />
        <Button type="button" onClick={submit} disabled={submitting}>
          {submitting ? "Verifying…" : "Verify email"}
        </Button>
        <div className="text-center text-caption text-steel">
          {cooldown > 0 ? (
            <span>Resend code in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="text-xs font-semibold text-signal-blue hover:text-signal-blue/80 transition-colors disabled:opacity-60"
            >
              Didn&apos;t get it? Resend code
            </button>
          )}
        </div>
        <div className="flex items-start gap-3 rounded-cards border border-sky-wash bg-sky-wash/60 p-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-signal-blue" />
          <p className="text-caption text-slate-custom font-medium leading-relaxed">
            We sent a 6-digit code to your email. Check your spam folder if you don&apos;t see it.
          </p>
        </div>
        <LinkBack />
      </motion.div>
    </AuthLayout>
  );
}

function LinkBack() {
  return (
    <p className="text-center text-sm font-medium text-ash">
      <a href="/login" className="inline-flex items-center justify-center gap-1.5 text-signal-blue hover:text-signal-blue/80 font-bold transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to login
      </a>
    </p>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpInner />
    </Suspense>
  );
}
