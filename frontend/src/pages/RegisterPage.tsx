import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../features/auth/api";
import { useAuth } from "../providers/AuthProvider";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import RoleSelector from "../components/auth/RoleSelector";

const schema = z.object({
  username: z.string().min(3, "Min 3 characters").max(30),
  full_name: z.string().min(1, "Full name is required").max(255),
  email: z.string().email("Enter a valid email"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .refine((val) => !val.includes(" "), "Password cannot contain spaces"),
  confirmPassword: z.string(),
  terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

function getPasswordStrength(password: string): { level: "weak" | "medium" | "strong"; score: number } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: "weak", score };
  if (score <= 4) return { level: "medium", score };
  return { level: "strong", score };
}

const requirements = [
  { label: "At least 6 characters", test: (v: string) => v.length >= 6 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
];

export default function RegisterPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<"BUSINESS" | "PROMOTER" | null>(null);
  const [roleError, setRoleError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const password = watch("password", "");
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const registerMutation = useRegister();

  if (authLoading) return null;
  if (user) return null;

  const onSubmit = (data: FormValues) => {
    if (!role) { setRoleError(true); return; }
    setServerError(null);
    const { confirmPassword, terms, ...payload } = data;
    registerMutation.mutate({ ...payload, role }, {
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
        setServerError(msg);
      },
    });
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-gray-900 text-center">Create your account</h1>
        <p className="text-sm text-gray-500 text-center mt-1">Join Nepal's promoter marketplace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {serverError && (
          <div className="bg-brand-coral-50 border border-brand-coral/20 text-brand-coral-900 px-3 py-2.5 rounded-lg text-sm flex items-start gap-2.5">
            <AlertCircle size={16} className="mt-0.5 text-brand-coral flex-shrink-0" />
            <span className="flex-1">{serverError}</span>
          </div>
        )}

        <RoleSelector role={role} onSelect={(r) => { setRole(r); setRoleError(false); }} error={roleError} />

        <Input
          label="Username"
          placeholder="@yourhandle"
          error={errors.username?.message}
          helperText={!errors.username ? "This will be your public handle" : undefined}
          {...register("username")}
        />

        <Input
          label="Full name"
          placeholder="Your full name"
          error={errors.full_name?.message}
          {...register("full_name")}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength.level === "weak" ? "bg-brand-coral w-1/3" :
                      strength.level === "medium" ? "bg-brand-amber w-2/3" :
                      "bg-brand-teal w-full"
                    }`}
                  />
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wide ${
                  strength.level === "weak" ? "text-brand-coral" :
                  strength.level === "medium" ? "text-brand-amber" :
                  "text-brand-teal"
                }`}>
                  {strength.level}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {requirements.map((req) => {
                  const met = req.test(password);
                  return (
                    <span key={req.label} className={`flex items-center gap-1.5 text-[11px] ${met ? "text-brand-teal" : "text-gray-400"}`}>
                      {met ? <CheckCircle2 size={12} /> : <span className="w-3 h-3 rounded-full border border-gray-200" />}
                      {req.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {errors.password && <p className="text-xs text-brand-coral mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1.5">Confirm password</label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              id="confirmPassword"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-brand-coral mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            {...register("terms")}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-indigo focus:ring-brand-indigo"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            I agree to the{" "}
            <Link to="/terms" className="text-brand-purple hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-brand-purple hover:underline">Privacy Policy</Link>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-brand-coral -mt-2">{errors.terms.message}</p>}

        <button
          type="submit"
          disabled={registerMutation.isPending || !role}
          className="w-full mt-1 bg-brand-indigo text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {registerMutation.isPending && <Loader2 size={16} className="animate-spin" />}
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-purple hover:underline font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
