"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-heading-lg font-semibold text-midnight-ink">Something went wrong</h1>
      <p className="text-body text-ash">An unexpected error occurred on this page.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-buttons bg-signal-blue px-6 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
