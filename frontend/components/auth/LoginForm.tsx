"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { notifySuccess, notifyError } from "@/lib/notify";
import { login, resendVerification } from "@/features/auth/api";
import { DashboardPath, Role } from "@/lib/roles";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [notVerified, setNotVerified] = useState<{ email: string } | null>(null);
  const [resending, setResending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setNotVerified(null);
    try {
      const user = await login(values);
      window.location.href = DashboardPath[user.role as Role] ?? "/";
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "";
      if (message.toLowerCase().includes("verify")) {
        setNotVerified({ email: values.email });
      } else {
        notifyError("Invalid email or password");
      }
    }
  });

  const resend = async () => {
    if (!notVerified) return;
    setResending(true);
    try {
      await resendVerification({ email: notVerified.email });
      notifySuccess("Verification email resent.");
    } catch {
      notifyError("Something went wrong.");
    } finally {
      setResending(false);
    }
  };

  if (notVerified) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-cards border border-signal-blue/30 bg-sky-wash/60 p-3">
          <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-signal-blue" />
          <p className="text-caption text-slate-custom font-medium leading-relaxed">
            Your email isn&apos;t verified yet. Check your inbox for the verification link, or resend it below.
          </p>
        </div>
        <Button type="button" onClick={resend} disabled={resending}>
          {resending ? "Sending…" : "Resend verification email"}
        </Button>
        <button
          type="button"
          onClick={() => setNotVerified(null)}
          className="text-xs font-semibold text-signal-blue hover:text-signal-blue/80 transition-colors"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="space-y-4">
        <Input label="Email Address" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />
      </div>
      
      <div className="flex items-center justify-end">
        <a href="/forgot-password" className="text-xs font-semibold text-signal-blue hover:text-signal-blue/80 transition-colors">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full h-12 flex items-center justify-center gap-2 rounded-button bg-signal-blue text-white text-sm font-bold shadow-sm hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 8v0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        ) : "Sign in to Dashboard"}
      </button>
    </form>
  );
}
