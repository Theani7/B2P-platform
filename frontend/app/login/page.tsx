import Link from "next/link";
import { GuestOnly } from "@/components/common/GuestOnly";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function LoginPage() {
  return (
    <GuestOnly>
      <AuthLayout>
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-graphite mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-ash font-medium">Sign in to your Byparsathy workspace.</p>
        </div>
        
        <LoginForm />
        
        <p className="mt-8 text-center text-sm font-medium text-ash">
          Don't have an account?{" "}
          <Link href="/register" className="text-signal-blue hover:text-signal-blue/80 font-bold transition-colors">
            Create one now
          </Link>
        </p>
      </AuthLayout>
    </GuestOnly>
  );
}
