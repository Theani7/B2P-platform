import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../features/auth/api";
import { useNavigate, Link } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const login = useLogin();
  const navigate = useNavigate();

  const onSubmit = (data: FormValues) => {
    login.mutate(data, { onSuccess: () => navigate("/") });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-sm"
      >
        <h2 className="mb-4 text-2xl font-semibold text-text">Login</h2>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input {...register("email")} type="email" className="mt-1 block w-full rounded border p-2" />
          {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input {...register("password")} type="password" className="mt-1 block w-full rounded border p-2" />
          {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("remember")} className="h-4 w-4" />
            <span className="text-sm">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary">Forgot password?</Link>
        </div>
        <button
          type="submit"
          disabled={login.isLoading}
          className="w-full rounded bg-primary py-2 font-medium text-white hover:bg-primary-600"
        >
          {login.isLoading ? "Logging in…" : "Login"}
        </button>
        <p className="mt-4 text-center text-sm">
          No account? <Link to="/register" className="text-primary">Register</Link>
        </p>
      </form>
    </div>
  );
}
