"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { notifySuccess, notifyError } from "@/lib/notify";
import api from "@/lib/apiClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { AuthLayout } from "@/components/auth/AuthLayout";

const schema = z.object({
  password: z.string().min(6, "At least 6 characters"),
});
type Values = z.infer<typeof schema>;

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      notifyError("Missing reset token.");
      return;
    }
    try {
      await api.post("/auth/reset-password", { token, password: values.password });
      notifySuccess("Password reset. Please sign in.");
      router.push("/login");
    } catch {
      notifyError("Reset failed or link expired.");
    }
  });

  return (
    <AuthLayout>
      <h1 className="mb-6 text-center text-heading-lg font-semibold tracking-tight text-midnight-ink">
        Set a new password
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="New password"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Button type="submit" disabled={isSubmitting || !token}>
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
