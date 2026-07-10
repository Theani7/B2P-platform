"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { notifySuccess, notifyError } from "@/lib/notify";
import { register as registerUser } from "@/features/auth/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DashboardPath, Role } from "@/lib/roles";

const schema = z.object({
  fullName: z.string().min(2, "Required"),
  username: z
    .string()
    .min(3, "At least 3 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, - and _ only"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  role: z.enum([Role.BUSINESS, Role.PROMOTER]),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: Role.BUSINESS },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await registerUser(values);
      window.location.href = DashboardPath[user.role as Role] ?? "/";
    } catch {
      notifyError("Could not create account");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input label="Full name" {...register("fullName")} error={errors.fullName?.message} />
      <Input label="Username" {...register("username")} error={errors.username?.message} />
      <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
      <Input
        label="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />
      <label className="block">
        <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">I am a</span>
        <select
          {...register("role")}
          className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none focus:border-primary"
        >
          <option value={Role.BUSINESS}>Business</option>
          <option value={Role.PROMOTER}>Promoter</option>
        </select>
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
