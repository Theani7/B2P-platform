import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../features/auth/api";
import { useAuth } from "../providers/AuthProvider";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const loginMutation = useLogin();

  if (authLoading) return null;
  if (user) {
    if (user.role === "BUSINESS") return <Navigate to="/business/dashboard" replace />;
    if (user.role === "PROMOTER") return <Navigate to="/promoter/dashboard" replace />;
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  }

  const onSubmit = (data: FormValues) => {
    setServerError(null);
    loginMutation.mutate(data, {
      onError: (err: any) => {
        let msg = "Login failed. Please check your credentials.";
        if (err?.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err?.response?.data?.detail) {
          const detail = err.response.data.detail;
          msg = Array.isArray(detail) && detail.length > 0 ? detail[0].msg : detail;
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
        <h1 className="text-heading text-midnight-ink text-center">Welcome back</h1>
        <p className="text-body text-steel text-center mt-2">Continue managing your collaborations</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {serverError && (
          <div className="bg-coral-alert/10 border border-coral-alert/20 text-coral-alert px-3 py-2.5 rounded-inputs text-sm flex items-start gap-2.5">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span className="flex-1">{serverError}</span>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-xs font-medium text-graphite">Password</label>
            <Link to="/forgot-password" className="text-xs text-signal-blue hover:underline">Forgot password?</Link>
          </div>
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
          {errors.password && <p className="text-xs text-coral-alert mt-1.5">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-1 hero-blue-fade text-white rounded-button py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
        >
          {loginMutation.isPending && <Loader2 size={16} className="animate-spin" />}
          {loginMutation.isPending ? "Logging in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-graphite text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-signal-blue hover:underline font-medium">Create account</Link>
      </p>
    </AuthLayout>
  );
}
