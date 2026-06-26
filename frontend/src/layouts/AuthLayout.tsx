import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full mx-auto pt-20 pb-12">
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <Link to="/" className="flex items-center justify-center gap-0.5 text-base font-medium mb-6">
            <span className="text-brand-purple">Byparsathy</span>
          </Link>
          {children}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="hover:text-gray-600">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
