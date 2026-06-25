import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../features/auth/api";
import { useAuth } from "../providers/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";

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
    if (user.role === "BUSINESS") { navigate("/business/dashboard", { replace: true }); return null; }
    if (user.role === "PROMOTER") { navigate("/promoter/dashboard", { replace: true }); return null; }
    if (user.role === "ADMIN") { navigate("/admin", { replace: true }); return null; }
  }

  const onSubmit = (data: FormValues) => {
    setServerError(null);
    loginMutation.mutate(data, {
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Login failed. Please try again.";
        setServerError(msg);
      },
    });
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-medium text-gray-900 text-center">Welcome back</h1>
      <p className="text-sm text-gray-500 text-center mt-1 mb-8">Log in to your B2P Connect account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
          <input
            {...register("email")}
            type="email"
            id="email"
            placeholder="you@company.com"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
          />
          {errors.email && <p className="text-xs text-brand-coral mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="text-xs font-medium text-gray-700">Password</label>
            <Link to="/forgot-password" className="text-xs text-brand-purple hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-brand-coral mt-1">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-2 bg-brand-coral text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loginMutation.isPending && <Loader2 size={16} className="animate-spin" />}
          {loginMutation.isPending ? "Logging in..." : "Log in"}
        </button>

        {serverError && <p className="text-xs text-brand-coral text-center mt-2">{serverError}</p>}
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <p className="text-sm text-gray-500 text-center">
        Don't have an account?{" "}
        <Link to="/register" className="text-brand-purple hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
