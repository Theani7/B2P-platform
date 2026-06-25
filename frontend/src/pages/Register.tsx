import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../features/auth/api";
import { useNavigate, Link } from "react-router-dom";
import { notifySuccess, notifyError } from "../hooks/useToast";

const schema = z.object({
  full_name: z.string().min(1, "Name required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
  role: z.enum(["BUSINESS", "PROMOTER"]),
  username: z.string().min(3, "Username must be at least 3 characters"),
}).refine((data) => data.password === data.confirm_password, {
  path: ["confirm_password"],
  message: "Passwords do not match",
});

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const registerMut = useRegister();
  const navigate = useNavigate();

  const onSubmit = (data: FormValues) => {
    const { confirm_password, ...payload } = data;
    registerMut.mutate(payload as any, {
      onSuccess: () => {
        notifySuccess("Account created. Please verify your email.");
        navigate("/login");
      },
      onError: () => notifyError("Registration failed. Please try again."),
    });
  };

  const selectedRole = watch("role");

  const RoleCard = ({ role, title, desc }: { role: "BUSINESS" | "PROMOTER"; title: string; desc: string }) => (
    <label className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-colors ${
      selectedRole === role
        ? "border-brand-purple bg-brand-purple-50"
        : "border-gray-200 hover:bg-gray-50"
    }`}>
      <input type="radio" value={role} {...register("role")} className="hidden" />
      <span className="text-sm font-medium text-gray-900">{title}</span>
      <span className="mt-1 text-xs text-gray-500">{desc}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-brand-purple font-medium text-xl">B2P</span>
          <span className="text-gray-900 font-medium text-xl">Connect</span>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <h1 className="text-xl font-medium text-gray-900 mb-6">Create your account</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <RoleCard role="BUSINESS" title="Business" desc="I want to hire promoters" />
              <RoleCard role="PROMOTER" title="Promoter" desc="I want to work with businesses" />
            </div>
            {errors.role && <p className="text-sm text-brand-coral" role="alert">{errors.role.message}</p>}
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-medium text-gray-900">Username</label>
              <input
                {...register("username")}
                id="username"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
              />
              {errors.username && <p className="text-sm text-brand-coral" role="alert">{errors.username.message}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-900">Full name</label>
              <input
                {...register("full_name")}
                id="full_name"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
              />
              {errors.full_name && <p className="text-sm text-brand-coral" role="alert">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email</label>
              <input
                {...register("email")}
                type="email"
                id="email"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
              />
              {errors.email && <p className="text-sm text-brand-coral" role="alert">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password</label>
              <input
                {...register("password")}
                type="password"
                id="password"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
              />
              {errors.password && <p className="text-sm text-brand-coral" role="alert">{errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-900">Confirm password</label>
              <input
                {...register("confirm_password")}
                type="password"
                id="confirm_password"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
              />
              {errors.confirm_password && <p className="text-sm text-brand-coral" role="alert">{errors.confirm_password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={registerMut.isPending}
              className="w-full bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {registerMut.isPending ? "Creating..." : "Create account"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">Already have an account? </span>
            <Link to="/login" className="text-sm text-brand-purple hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}