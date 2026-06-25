import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../features/auth/api";
import { useNavigate } from "react-router-dom";
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
    <label className={`flex cursor-pointer flex-col rounded border p-4 ${selectedRole === role ? "border-primary" : "border-gray-300"}`}>
      <input type="radio" value={role} {...register("role")} className="hidden" />
      <span className="text-lg font-medium">{title}</span>
      <span className="mt-1 text-sm text-gray-600">{desc}</span>
    </label>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input {...register("username")} aria-label="Username" className="mt-1 block w-full rounded border p-2" />
        {errors.username && <p className="mt-1 text-sm text-danger">{errors.username.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Full Name</label>
        <input {...register("full_name")} aria-label="Full Name" className="mt-1 block w-full rounded border p-2" />
        {errors.full_name && <p className="mt-1 text-sm text-danger">{errors.full_name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input {...register("email")} type="email" aria-label="Email" className="mt-1 block w-full rounded border p-2" />
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <RoleCard role="BUSINESS" title="Business" desc="I want to hire promoters" />
        <RoleCard role="PROMOTER" title="Promoter" desc="I want to work with businesses" />
      </div>
      {errors.role && <p className="mt-1 text-sm text-danger">{errors.role.message}</p>}
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input {...register("password")} type="password" aria-label="Password" className="mt-1 block w-full rounded border p-2" />
        {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Confirm Password</label>
        <input {...register("confirm_password")} type="password" aria-label="Confirm Password" className="mt-1 block w-full rounded border p-2" />
        {errors.confirm_password && <p className="mt-1 text-sm text-danger">{errors.confirm_password.message}</p>}
      </div>
      <button type="submit" disabled={registerMut.isPending} className="w-full rounded bg-primary py-2 font-medium text-white hover:bg-primary-600">
        {registerMut.isPending ? "Creating…" : "Create Account"}
      </button>
    </form>
  );
}
