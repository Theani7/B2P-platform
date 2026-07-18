import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button } from "../components/ui";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { getErrorMessage } from "../utils/error";
import apiClient from "../services/apiClient";
import { Building2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await apiClient.post("/auth/forgot-password", data);
      setSuccess(true);
      notifySuccess("Password reset link sent to your email!");
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linen-canvas bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="w-full max-w-[420px] bg-white rounded-cards shadow-product-card p-8 border border-slate-custom/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-signal-blue rounded-xl text-white mb-4 shadow-signal-blue/20 shadow-lg">
            <Building2 size={24} />
          </div>
          <h1 className="text-heading font-bold text-graphite mb-2">Forgot Password?</h1>
          <p className="text-ash text-sm">
            {success ? "Check your email for a link to reset your password." : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Button type="submit" isLoading={isSubmitting} className="w-full h-12 text-sm font-semibold">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <Button onClick={() => window.location.href = "/login"} variant="outline" className="w-full h-12 text-sm font-semibold">
            Back to Login
          </Button>
        )}

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
