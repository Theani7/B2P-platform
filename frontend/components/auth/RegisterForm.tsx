"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { notifySuccess, notifyError } from "@/lib/notify";
import { register as registerUser } from "@/features/auth/api";
import { Input } from "@/components/ui/Input";
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: Role.BUSINESS },
  });

  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await registerUser(values);
      window.location.href = DashboardPath[user.role as Role] ?? "/";
    } catch {
      notifyError("Could not create account");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" {...register("fullName")} error={errors.fullName?.message} />
        <Input label="Username" {...register("username")} error={errors.username?.message} />
      </div>
      
      <Input label="Email Address" type="email" {...register("email")} error={errors.email?.message} />
      <Input
        label="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />
      
      <div className="pt-2">
        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-graphite">
          I am joining as a
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`relative flex cursor-pointer rounded-inputs border p-4 focus:outline-none transition-all ${
            selectedRole === Role.BUSINESS
              ? 'border-signal-blue bg-sky-wash/50 ring-2 ring-signal-blue/20 shadow-sm'
              : 'border-slate-custom/20 hover:border-signal-blue hover:bg-sky-wash/30 bg-white'
          }`}>
            <input type="radio" value={Role.BUSINESS} {...register("role")} className="sr-only" />
            <div className="flex flex-col w-full text-center relative z-10">
              <span className={`text-sm font-bold mb-1 transition-colors ${selectedRole === Role.BUSINESS ? 'text-signal-blue' : 'text-graphite'}`}>Business</span>
              <span className={`text-xs font-medium transition-colors ${selectedRole === Role.BUSINESS ? 'text-signal-blue/70' : 'text-ash'}`}>I want to hire creators</span>
            </div>
            {selectedRole === Role.BUSINESS && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-signal-blue rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </label>
          
          <label className={`relative flex cursor-pointer rounded-inputs border p-4 focus:outline-none transition-all ${
            selectedRole === Role.PROMOTER
              ? 'border-signal-blue bg-sky-wash/50 ring-2 ring-signal-blue/20 shadow-sm'
              : 'border-slate-custom/20 hover:border-signal-blue hover:bg-sky-wash/30 bg-white'
          }`}>
            <input type="radio" value={Role.PROMOTER} {...register("role")} className="sr-only" />
            <div className="flex flex-col w-full text-center relative z-10">
              <span className={`text-sm font-bold mb-1 transition-colors ${selectedRole === Role.PROMOTER ? 'text-signal-blue' : 'text-graphite'}`}>Creator</span>
              <span className={`text-xs font-medium transition-colors ${selectedRole === Role.PROMOTER ? 'text-signal-blue/70' : 'text-ash'}`}>I want to get hired</span>
            </div>
            {selectedRole === Role.PROMOTER && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-signal-blue rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full h-12 flex items-center justify-center gap-2 rounded-button bg-signal-blue text-white text-sm font-bold shadow-sm hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </span>
        ) : "Create Account"}
      </button>
    </form>
  );
}
