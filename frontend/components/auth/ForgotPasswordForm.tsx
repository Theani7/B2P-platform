"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check } from "lucide-react";
import { notifySuccess, notifyError } from "@/lib/notify";
import { getApiError } from "@/lib/apiError";
import { forgotPassword, verifyResetCode, resetPassword } from "@/features/auth/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";

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

type Step = "email" | "code" | "password" | "done";

export function ForgotPasswordForm({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [cooldown, setCooldown] = useState(0);

  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const requestCode = emailForm.handleSubmit(async (values) => {
    try {
      await forgotPassword(values);
      setEmail(values.email);
      setCode("");
      setCooldown(30);
      setStep("code");
      notifySuccess("If an account exists, a reset code was sent.");
    } catch (err: unknown) {
      notifyError(getApiError(err, "Something went wrong."));
    }
  });

  const resendCode = async () => {
    if (cooldown > 0) return;
    try {
      await forgotPassword({ email });
      setCode("");
      setCooldown(30);
      notifySuccess("A new code was sent.");
    } catch (err: unknown) {
      notifyError(getApiError(err, "Something went wrong."));
    }
  };

  const submitCode = async () => {
    if (code.length !== 6) {
      notifyError("Enter the 6-digit code.");
      return;
    }
    try {
      const { token } = await verifyResetCode({ email, code });
      setVerifyToken(token);
      setStep("password");
    } catch (err: unknown) {
      notifyError(getApiError(err, "Invalid or expired code."));
    }
  };

  const submitPassword = passwordForm.handleSubmit(async (values) => {
    try {
      await resetPassword({ token: verifyToken, new_password: values.password });
      setStep("done");
      notifySuccess("Password reset. Please sign in.");
    } catch (err: unknown) {
      notifyError(getApiError(err, "Session expired. Please request a new code."));
      setStep("code");
    }
  });

  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-status/10 text-emerald-status">
          <Check className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-graphite">Password updated</h2>
          <p className="mt-1 text-sm text-ash">Sign in with your new credentials.</p>
        </div>
        <Button className="w-full" onClick={onDone}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-graphite">
          {step === "email" && "Reset your password"}
          {step === "code" && "Enter your code"}
          {step === "password" && "Choose a new password"}
        </h2>
        <p className="mt-1 text-sm text-ash">
          {step === "email" && "We will email you a 6-digit code."}
          {step === "code" && `Code sent${email ? ` to ${email}` : ""}.`}
          {step === "password" && "Code verified. Set a new password."}
        </p>
      </div>

      {step === "email" && (
        <form onSubmit={requestCode} className="flex flex-col gap-4">
          <Input label="Email address" type="email" autoComplete="email" {...emailForm.register("email")} error={emailForm.formState.errors.email?.message} />
          <Button type="submit" disabled={emailForm.formState.isSubmitting}>
            {emailForm.formState.isSubmitting ? "Sending…" : "Send reset code"}
          </Button>
        </form>
      )}

      {step === "code" && (
        <div className="flex flex-col gap-4">
          <OtpInput length={6} value={code} onChange={setCode} autoFocus />
          <Button type="button" onClick={submitCode}>Verify code</Button>
          <div className="text-center text-caption text-steel">
            {cooldown > 0 ? (
              <span>Resend code in {cooldown}s</span>
            ) : (
              <button type="button" onClick={resendCode} className="text-xs font-semibold text-signal-blue hover:text-signal-blue/80">
                Didn&apos;t get it? Resend code
              </button>
            )}
          </div>
        </div>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} className="flex flex-col gap-4">
          <Input label="New password" type="password" autoComplete="new-password" {...passwordForm.register("password")} error={passwordForm.formState.errors.password?.message} />
          <Input label="Confirm password" type="password" autoComplete="new-password" {...passwordForm.register("confirm")} error={passwordForm.formState.errors.confirm?.message} />
          <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Saving…" : "Reset password"}
          </Button>
        </form>
      )}

      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-signal-blue hover:text-signal-blue/80"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </button>
    </div>
  );
}
