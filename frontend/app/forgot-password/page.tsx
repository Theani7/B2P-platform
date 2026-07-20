"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { notifySuccess, notifyError } from "@/lib/notify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forgotPassword, verifyResetCode, resetPassword } from "@/features/auth/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { AuthLayout } from "@/components/auth/AuthLayout";

const emailSchema = z.object({ email: z.string().email("Enter a valid email") });
const passwordSchema = z
  .object({
    password: z.string().min(6, "At least 6 characters"),
    confirm: z.string().min(6, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
type EmailValues = z.infer<typeof emailSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

type Step = "email" | "code" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [cooldown, setCooldown] = useState(0);

  const emailForm = useForm<EmailValues>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const resendCode = async () => {
    if (cooldown > 0) return;
    try {
      await forgotPassword({ email });
      setCode("");
      setCooldown(30);
      notifySuccess("A new code was sent.");
    } catch {
      notifyError("Something went wrong.");
    }
  };

  const requestCode = emailForm.handleSubmit(async (values) => {
    try {
      await forgotPassword(values);
      setEmail(values.email);
      setCode("");
      setCooldown(30);
      setStep("code");
      notifySuccess("If an account exists, a reset code was sent.");
    } catch {
      notifyError("Something went wrong.");
    }
  });

  const submitCode = async () => {
    if (code.length !== 6) {
      notifyError("Enter the 6-digit code.");
      return;
    }
    try {
      const { token } = await verifyResetCode({ email, code });
      setVerifyToken(token);
      setStep("password");
    } catch {
      notifyError("Invalid or expired code.");
    }
  };

  const submitPassword = passwordForm.handleSubmit(async (values) => {
    try {
      await resetPassword({ token: verifyToken, new_password: values.password });
      setStep("done");
      notifySuccess("Password reset. Please sign in.");
    } catch {
      notifyError("Session expired. Please request a new code.");
      setStep("code");
    }
  });

  return (
    <AuthLayout>
      <div className="mb-10 text-center sm:text-left">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-cardlarge bg-signal-blue/10 text-signal-blue">
          <KeyRound className="h-6 w-6" />
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-graphite mb-2">
          {step === "email" && "Reset your password"}
          {step === "code" && "Enter your code"}
          {step === "password" && "Choose a new password"}
          {step === "done" && "All set"}
        </h1>
        <p className="text-sm text-ash font-medium">
          {step === "email" && "Enter your account email and we'll send a secure 6-digit code."}
          {step === "code" && "We emailed a 6-digit code. Enter it below to continue."}
          {step === "password" && "Code verified. Set a new password for your account."}
          {step === "done" && "Your password has been updated. Sign in with your new credentials."}
        </p>
      </div>

      {step !== "done" && (
        <div className="mb-8 flex items-center gap-2">
          {["email", "code", "password"].map((s, i) => {
            const order: Step[] = ["email", "code", "password"];
            const active = order.indexOf(step) >= i;
            return <div key={s} className="h-1.5 flex-1 rounded-full transition-colors bg-sky-wash" style={{ backgroundColor: active ? "#145aff" : undefined }} />;
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.form
            key="email"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={requestCode}
            className="flex flex-col gap-4"
          >
            <div className="flex items-start gap-3 rounded-cards border border-sky-wash bg-sky-wash/60 p-3">
              <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-signal-blue" />
              <p className="text-caption text-slate-custom font-medium leading-relaxed">
                For your security, the reset code is sent to the email on file. If you don't see it within a few minutes, check your spam folder.
              </p>
            </div>

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              {...emailForm.register("email")}
              error={emailForm.formState.errors.email?.message}
            />

            <Button type="submit" disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting ? "Sending…" : "Send reset code"}
            </Button>
          </motion.form>
        )}

        {step === "code" && (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <OtpInput length={6} value={code} onChange={setCode} autoFocus />
            <Button type="button" onClick={submitCode}>
              Verify code
            </Button>
            <div className="text-center text-caption text-steel">
              {cooldown > 0 ? (
                <span>Resend code in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  className="text-xs font-semibold text-signal-blue hover:text-signal-blue/80 transition-colors"
                >
                  Didn't get it? Resend code
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-signal-blue hover:text-signal-blue/80 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Use a different email
            </button>
          </motion.div>
        )}

        {step === "password" && (
          <motion.form
            key="password"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={submitPassword}
            className="flex flex-col gap-4"
          >
            <div className="flex items-start gap-3 rounded-cards border border-emerald-status/30 bg-emerald-status/5 p-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-status" />
              <p className="text-caption text-slate-custom font-medium leading-relaxed">
                Code verified. Create a new password you don't use elsewhere.
              </p>
            </div>

            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("password")}
              error={passwordForm.formState.errors.password?.message}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("confirm")}
              error={passwordForm.formState.errors.confirm?.message}
            />

            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? "Saving…" : "Reset password"}
            </Button>
          </motion.form>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-cardlarge bg-emerald-status/10 text-emerald-status">
              <Check className="h-8 w-8" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-graphite">Password updated</h2>
              <p className="mt-1 text-sm text-ash font-medium">
                Your password has been changed. Sign in with your new credentials.
              </p>
            </div>
            <Button onClick={() => router.push("/login")} className="w-full">
              Continue to sign in
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-caption text-fog">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span className="font-medium">Secured by Byparsathy</span>
      </div>

      <p className="mt-4 text-center text-sm font-medium text-ash">
        Remembered it?{" "}
        <Link href="/login" className="text-signal-blue hover:text-signal-blue/80 font-bold transition-colors">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
