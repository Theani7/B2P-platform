import Link from "next/link";
import { GuestOnly } from "@/components/common/GuestOnly";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  return (
    <GuestOnly>
      <AuthLayout>
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-graphite mb-2">
            Create an account
          </h1>
          <p className="text-sm text-ash font-medium">Join Byparsathy as a business or promoter.</p>
        </div>
        
        <RegisterForm />
        
        <p className="mt-8 text-center text-sm font-medium text-ash">
          Already have an account?{" "}
          <Link href="/login" className="text-signal-blue hover:text-signal-blue/80 font-bold transition-colors">
            Sign in
          </Link>
        </p>
      </AuthLayout>
    </GuestOnly>
  );
}
