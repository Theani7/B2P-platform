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
    const { confirmPassword, ...payload } = data;
    registerMutation.mutate({ ...payload, role }, {
      onError: (err: any) => {
        let msg = "Registration failed. Please try again.";
        if (err?.response?.data?.message) {
          msg = typeof err.response.data.message === "string" ? err.response.data.message : JSON.stringify(err.response.data.message);
        } else if (err?.response?.data?.detail) {
          const detail = err.response.data.detail;
          if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
            msg = detail[0].msg;
          } else if (typeof detail === "string") {
            msg = detail;
          } else {
            msg = JSON.stringify(detail);
          }
        } else if (err?.message) {
          msg = err.message;
        }
        setServerError(msg);
      },
    });
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-heading text-midnight-ink text-center">Create your account</h1>
        <p className="text-body text-steel text-center mt-2">Join Nepal&apos;s promoter marketplace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {serverError && (
          <div className="bg-coral-alert/10 border border-coral-alert/20 text-coral-alert px-3 py-2.5 rounded-inputs text-sm flex items-start gap-2.5">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
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
          <label htmlFor="password" className="block text-xs font-medium text-graphite mb-1.5">Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-slate-custom/20 rounded-inputs bg-white text-midnight-ink placeholder-fog focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fog hover:text-graphite transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1 bg-slate-custom/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength.level === "weak" ? "bg-coral-alert w-1/3" :
                      strength.level === "medium" ? "bg-amber-tag w-2/3" :
                      "bg-emerald-status w-full"
                    }`}
                  />
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wider ${
                  strength.level === "weak" ? "text-coral-alert" :
                  strength.level === "medium" ? "text-amber-tag" :
                  "text-emerald-status"
                }`}>
                  {strength.level}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {requirements.map((req) => {
                  const met = req.test(password);
                  return (
                    <span key={req.label} className={`flex items-center gap-1.5 text-[11px] ${met ? "text-emerald-status" : "text-fog"}`}>
                      {met ? <CheckCircle2 size={12} /> : <span className="w-3 h-3 rounded-full border border-slate-custom/20" />}
                      {req.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {errors.password && <p className="text-xs text-coral-alert mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-graphite mb-1.5">Confirm password</label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              id="confirmPassword"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-slate-custom/20 rounded-inputs bg-white text-midnight-ink placeholder-fog focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fog hover:text-graphite transition-colors"
              tabIndex={-1}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-coral-alert mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending || !role}
          className="w-full mt-1 hero-blue-fade text-white rounded-button py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
        >
          {registerMutation.isPending && <Loader2 size={16} className="animate-spin" />}
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-graphite text-center mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-signal-blue hover:underline font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
