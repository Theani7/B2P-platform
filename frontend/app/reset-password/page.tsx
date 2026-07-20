"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { notifySuccess, notifyError } from "@/lib/notify";
import { resetPassword } from "@/features/auth/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { AuthLayout } from "@/components/auth/AuthLayout";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  code: z.string().length(6, "Enter the 6-digit code"),
  password: z.string().min(6, "At least 6 characters"),
});
type Values = z.infer<typeof schema>;

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: params.get("email") ?? "" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPassword({ token: values.code, new_password: values.password });
      notifySuccess("Password reset. Please sign in.");
      router.push("/login");
    } catch {
      notifyError("Invalid or expired code.");
    }
  });

  return (
    <AuthLayout>
      <h1 className="mb-6 text-center text-heading-lg font-semibold tracking-tight text-midnight-ink">
        Set a new password
      </h1>
      <p className="mb-6 text-body text-slate-custom text-center">
        Enter the 6-digit code we emailed you.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
        <Input label="6-digit code" inputMode="numeric" maxLength={6} {...register("code")} error={errors.code?.message} />
        <Input label="New password" type="password" {...register("password")} error={errors.password?.message} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner full />}>
      <ResetForm />
    </Suspense>
  );
}
