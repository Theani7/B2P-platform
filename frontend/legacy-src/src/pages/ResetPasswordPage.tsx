import { useState } from "react";
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
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      notifyError("Missing reset token");
      return;
    }
    try {
      await apiClient.post("/auth/reset-password", { token, new_password: data.password });
      notifySuccess("Password successfully reset! You can now log in.");
      navigate("/login");
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linen-canvas">
        <div className="text-center">
          <h2 className="text-heading text-graphite mb-2">Invalid Reset Link</h2>
          <p className="text-ash mb-4">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password">
            <Button>Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linen-canvas bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="w-full max-w-[420px] bg-white rounded-cards shadow-product-card p-8 border border-slate-custom/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-signal-blue rounded-xl text-white mb-4 shadow-signal-blue/20 shadow-lg">
            <KeyRound size={24} />
          </div>
          <h1 className="text-heading font-bold text-graphite mb-2">Reset Password</h1>
          <p className="text-ash text-sm">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <Button type="submit" isLoading={isSubmitting} className="w-full h-12 text-sm font-semibold mt-2">
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}
