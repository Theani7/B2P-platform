import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button } from "../components/ui";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { getErrorMessage } from "../utils/error";
import apiClient from "../services/apiClient";
import { KeyRound } from "lucide-react";

const schema = z.object({
  code: z.string().length(6, "Enter the 6-digit code from your email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get("code");
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: codeParam ?? "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await apiClient.post("/auth/reset-password", { token: data.code, new_password: data.password });
      notifySuccess("Password successfully reset! You can now log in.");
      navigate("/login");
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linen-canvas bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="w-full max-w-[420px] bg-white rounded-cards shadow-product-card p-8 border border-slate-custom/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-signal-blue rounded-xl text-white mb-4 shadow-signal-blue/20 shadow-lg">
            <KeyRound size={24} />
          </div>
          <h1 className="text-heading font-bold text-graphite mb-2">Reset Password</h1>
          <p className="text-ash text-sm">Enter the 6-digit code we emailed you, then choose a new password.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Reset Code"
            placeholder="123456"
            inputMode="numeric"
            maxLength={6}
            error={errors.code?.message}
            {...register("code")}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button type="submit" loading={isSubmitting} className="w-full h-12 text-sm font-semibold mt-2">
            Reset Password
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-custom/10 text-center text-sm">
          <span className="text-ash">Remembered your password? </span>
          <Link to="/login" className="text-signal-blue font-semibold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
