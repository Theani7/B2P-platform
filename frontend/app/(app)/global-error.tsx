"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-linen-canvas">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-heading-lg font-semibold text-midnight-ink">Something went wrong</h1>
          <p className="text-body text-ash">An unexpected error occurred.</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-buttons bg-signal-blue px-6 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
