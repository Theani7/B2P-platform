import Link from "next/link";
import { GuestOnly } from "@/components/common/GuestOnly";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function LoginPage() {
  return (
    <GuestOnly>
      <AuthLayout>
        <h1 className="mb-1 text-heading-lg font-semibold tracking-tight text-midnight-ink">
          Welcome back
        </h1>
        <p className="mb-6 text-body text-slate-custom">Sign in to your Byparsathy workspace.</p>
        <LoginForm />
        <p className="mt-4 text-center text-caption text-steel">
          New here?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </AuthLayout>
    </GuestOnly>
  );
}
