"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { notifySuccess, notifyError } from "@/lib/notify";
import { login } from "@/features/auth/api";
import { DashboardPath, Role } from "@/lib/roles";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login(values);
      window.location.href = DashboardPath[user.role as Role] ?? "/";
    } catch {
      notifyError("Invalid email or password");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input label="Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        {...register("password")}
        error={errors.password?.message}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
