import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../features/auth/api";
import { Link, useNavigate } from "react-router-dom";
import { notifySuccess, notifyError } from "../hooks/useToast";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Min 6 characters"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const login = useLogin();
  const navigate = useNavigate();

  const onSubmit = (data: FormValues) => {
    login.mutate(data, {
      onSuccess: () => { notifySuccess("Welcome back!"); navigate("/"); },
      onError: () => notifyError("Login failed. Please check your credentials."),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-brand-purple font-medium text-xl">Byparsathy</span>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <h1 className="text-xl font-medium text-gray-900 mb-6">Sign in</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("remember")} className="h-4 w-4 rounded border-gray-300" />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-brand-purple hover:underline">Forgot password?</Link>
            </div>
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {login.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">Don't have an account? </span>
            <Link to="/register" className="text-sm text-brand-purple hover:underline">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}