"use client";

import { useEffect, useState } from "react";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { notifySuccess, notifyError } from "@/lib/notify";
import { register as registerUser, checkAvailability } from "@/features/auth/api";
import { Input } from "@/components/ui/Input";
import { Role } from "@/lib/roles";

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
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: Role.BUSINESS },
  });

  const selectedRole = useWatch({ control, name: "role" });
  const password = useWatch({ control, name: "password" }) || "";
  const username = useWatch({ control, name: "username" });
  const email = useWatch({ control, name: "email" });

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | undefined>(undefined);
  const [emailAvailable, setEmailAvailable] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setUsernameAvailable(undefined);
    if (!username || username.length < 3) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await checkAvailability({ username });
        if (!res.usernameAvailable) {
          setError("username", { type: "manual", message: "Username is already taken" });
          setUsernameAvailable(false);
        } else {
          if (errors.username?.type === "manual") clearErrors("username");
          setUsernameAvailable(true);
        }
      } catch (e) {}
    }, 500);
    return () => clearTimeout(timeout);
  }, [username, setError, clearErrors, errors.username]);

  useEffect(() => {
    setEmailAvailable(undefined);
    if (!email || !email.includes("@")) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await checkAvailability({ email });
        if (!res.emailAvailable) {
          setError("email", { type: "manual", message: "Email is already registered" });
          setEmailAvailable(false);
        } else {
          if (errors.email?.type === "manual") clearErrors("email");
          setEmailAvailable(true);
        }
      } catch (e) {}
    }, 500);
    return () => clearTimeout(timeout);
  }, [email, setError, clearErrors, errors.email]);

  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  
  const strengthScore = [hasMinLength, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  const getStrengthColor = () => {
    if (password.length === 0) return "bg-steel/20";
    if (strengthScore <= 1) return "bg-coral-alert";
    if (strengthScore === 2) return "bg-amber-tag";
    if (strengthScore >= 3) return "bg-emerald-status";
    return "bg-steel/20";
  };
  
  const getStrengthTextColor = () => {
    if (password.length === 0) return "text-ash";
    if (strengthScore <= 1) return "text-coral-alert";
    if (strengthScore === 2) return "text-amber-tag";
    if (strengthScore >= 3) return "text-emerald-status";
    return "text-ash";
  };
  
  const getStrengthLabel = () => {
    if (password.length === 0) return "Strength";
    if (strengthScore <= 1) return "Weak";
    if (strengthScore === 2) return "Fair";
    if (strengthScore >= 3) return "Strong";
    return "Strength";
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await registerUser(values);
      router.push(`/verify-otp?email=${encodeURIComponent(result.email)}`);
    } catch {
      notifyError("Could not create account");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" {...register("fullName")} error={errors.fullName?.message} />
        <Input label="Username" {...register("username")} error={errors.username?.message} success={usernameAvailable} />
      </div>
      
      <Input label="Email Address" type="email" {...register("email")} error={errors.email?.message} success={emailAvailable} />
      <div>
        <Input
          label="Password"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 flex gap-1 h-1.5">
            <div className={`flex-1 rounded-full transition-colors ${password.length > 0 ? getStrengthColor() : 'bg-slate-custom/10'}`} />
            <div className={`flex-1 rounded-full transition-colors ${strengthScore >= 2 ? getStrengthColor() : 'bg-slate-custom/10'}`} />
            <div className={`flex-1 rounded-full transition-colors ${strengthScore >= 3 ? getStrengthColor() : 'bg-slate-custom/10'}`} />
            <div className={`flex-1 rounded-full transition-colors ${strengthScore >= 4 ? getStrengthColor() : 'bg-slate-custom/10'}`} />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider w-14 text-right transition-colors ${getStrengthTextColor()}`}>
            {getStrengthLabel()}
          </span>
        </div>
      </div>
      
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
