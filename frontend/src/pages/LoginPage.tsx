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

  // Redirect if already logged in or after login
  if (authLoading) return null;
  if (user) {
    if (user.role === "BUSINESS") return <Navigate to="/business/dashboard" replace />;
    if (user.role === "PROMOTER") return <Navigate to="/promoter/dashboard" replace />;
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  }

  const onSubmit = (data: FormValues) => {
    setServerError(null);
    loginMutation.mutate(data, {
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Login failed. Please check your credentials.";
        setServerError(msg);
      },
    });
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-gray-900 text-center">Welcome back</h1>
        <p className="text-sm text-gray-500 text-center mt-1">Continue managing your collaborations</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {serverError && (
          <div className="bg-brand-coral-50 border border-brand-coral/20 text-brand-coral-900 px-3 py-2.5 rounded-lg text-sm flex items-start gap-2.5">
            <AlertCircle size={16} className="mt-0.5 text-brand-coral flex-shrink-0" />
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
            <label htmlFor="password" className="text-xs font-medium text-gray-700">Password</label>
            <Link to="/forgot-password" className="text-xs text-brand-purple hover:underline">Forgot password?</Link>
          </div>
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
          {errors.password && <p className="text-xs text-brand-coral mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-1 bg-brand-indigo text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loginMutation.isPending && <Loader2 size={16} className="animate-spin" />}
          {loginMutation.isPending ? "Logging in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-brand-purple hover:underline font-medium">Create account</Link>
      </p>
    </AuthLayout>
  );
}
