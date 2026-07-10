import Link from "next/link";
import { GuestOnly } from "@/components/common/GuestOnly";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  return (
    <GuestOnly>
      <AuthLayout>
        <h1 className="mb-1 text-heading-lg font-semibold tracking-tight text-midnight-ink">
          Create your account
        </h1>
        <p className="mb-6 text-body text-slate-custom">Join Byparsathy as a business or promoter.</p>
        <RegisterForm />
        <p className="mt-4 text-center text-caption text-steel">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </AuthLayout>
    </GuestOnly>
  );
}
