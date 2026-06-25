import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../features/auth/api";
import { useAuth } from "../providers/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Building2, UserCircle } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";

const schema = z.object({
  username: z.string().min(3, "Min 3 characters").max(30),
  full_name: z.string().min(1, "Full name is required").max(255),
  email: z.string().email("Enter a valid email"),
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/\d/, "Password must include at least one digit")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must include at least one special character")
    .refine((val) => !val.includes(" "), "Password cannot contain spaces"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"BUSINESS" | "PROMOTER" | null>(null);
  const [roleError, setRoleError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const registerMutation = useRegister();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      if (user.role === "BUSINESS") navigate("/business/dashboard", { replace: true });
      else if (user.role === "PROMOTER") navigate("/promoter/dashboard", { replace: true });
      else if (user.role === "ADMIN") navigate("/admin", { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) return null;
  if (user) return null;

  const onSubmit = (data: FormValues) => {
    if (!role) { setRoleError(true); return; }
    setServerError(null);
    const { confirmPassword, ...payload } = data;
    registerMutation.mutate({ ...payload, role }, {
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
        setServerError(msg);
      },
    });
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-medium text-gray-900 text-center">Create your account</h1>
      <p className="text-sm text-gray-500 text-center mt-1 mb-6">Join Nepal's promoter marketplace</p>

      {/* Role selector */}
      <label className="block text-xs font-medium text-gray-700 mb-3">I am a...</label>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => { setRole("BUSINESS"); setRoleError(false); }}
          className={`flex flex-col items-center rounded-xl border p-4 cursor-pointer transition-colors ${
            role === "BUSINESS"
              ? "border-brand-purple bg-brand-purple-50"
              : "border-gray-100 hover:bg-gray-50"
          }`}
        >
          <Building2 size={24} className={role === "BUSINESS" ? "text-brand-purple" : "text-gray-400"} />
          <span className={`text-sm font-medium mt-2 ${role === "BUSINESS" ? "text-brand-purple" : "text-gray-900"}`}>Business</span>
          <span className="text-xs text-gray-400 mt-1">I want to run campaigns</span>
        </button>
        <button
          type="button"
          onClick={() => { setRole("PROMOTER"); setRoleError(false); }}
          className={`flex flex-col items-center rounded-xl border p-4 cursor-pointer transition-colors ${
            role === "PROMOTER"
              ? "border-brand-teal bg-brand-teal-50"
              : "border-gray-100 hover:bg-gray-50"
          }`}
        >
          <UserCircle size={24} className={role === "PROMOTER" ? "text-brand-teal" : "text-gray-400"} />
          <span className={`text-sm font-medium mt-2 ${role === "PROMOTER" ? "text-brand-teal" : "text-gray-900"}`}>Promoter</span>
          <span className="text-xs text-gray-400 mt-1">I want to get discovered</span>
        </button>
      </div>
      {roleError && <p className="text-xs text-brand-coral mb-4">Please select a role</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1.5">Username</label>
          <input
            {...register("username")}
            id="username"
            placeholder="@yourhandle"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
          />
          <p className="text-[11px] text-gray-400 mt-1">This will be your public handle</p>
          {errors.username && <p className="text-xs text-brand-coral mt-1">{errors.username.message}</p>}
        </div>

        {/* Full name */}
        <div>
          <label htmlFor="full_name" className="block text-xs font-medium text-gray-700 mb-1.5">Full name</label>
          <input
            {...register("full_name")}
            id="full_name"
            placeholder="Your full name"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
          />
          {errors.full_name && <p className="text-xs text-brand-coral mt-1">{errors.full_name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
          <input
            {...register("email")}
            type="email"
            id="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
          />
          {errors.email && <p className="text-xs text-brand-coral mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
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
          <p className="text-[11px] text-gray-400 mt-1">Min 12 characters, with uppercase, lowercase, number, and special char</p>
          {errors.password && <p className="text-xs text-brand-coral mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1.5">Confirm password</label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              id="confirmPassword"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-brand-coral mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={registerMutation.isPending || !role}
          className="w-full mt-2 bg-brand-indigo text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {registerMutation.isPending && <Loader2 size={16} className="animate-spin" />}
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </button>

        {serverError && <p className="text-xs text-brand-coral text-center mt-2">{serverError}</p>}
      </form>

      <p className="text-[11px] text-gray-400 text-center mt-3">
        By creating an account you agree to our{" "}
        <Link to="/terms" className="text-brand-purple hover:underline">Terms</Link>
        {" "}and{" "}
        <Link to="/privacy" className="text-brand-purple hover:underline">Privacy Policy</Link>
      </p>

      <p className="text-sm text-gray-500 text-center mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-purple hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
