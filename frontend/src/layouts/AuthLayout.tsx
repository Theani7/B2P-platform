import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-sm">
        {(title || subtitle) && (
          <div className="text-center">
            {title && <h1 className="text-2xl font-bold text-text">{title}</h1>}
            {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
