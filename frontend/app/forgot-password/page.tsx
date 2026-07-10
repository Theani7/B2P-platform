"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import Link from "next/link";
import api from "@/lib/apiClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.post("/auth/forgot-password", values);
      toast.success("If an account exists, a reset email was sent.");
    } catch {
      toast.error("Something went wrong.");
    }
  });

  return (
    <AuthLayout>
      <h1 className="mb-1 text-heading-lg font-semibold tracking-tight text-midnight-ink">
        Reset your password
      </h1>
      <p className="mb-6 text-body text-slate-custom">
        Enter your email and we&apos;ll send a reset link.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-4 text-center text-caption text-steel">
        <Link href="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
