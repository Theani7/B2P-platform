import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 max-w-md w-full text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 w-full">
          <button
            onClick={() => window.history.back()}
            className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="flex-1 h-11 flex items-center justify-center rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
