import Link from "next/link";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linen-canvas">
      <header className="border-b border-slate-custom/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-midnight-ink">
            B2P Connect
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-ash hover:text-graphite">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-buttons bg-signal-blue px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <main className="py-8">{children}</main>
      <footer className="border-t border-slate-custom/10 py-8 text-center text-sm text-ash">
        &copy; {new Date().getFullYear()} B2P Connect. All rights reserved.
      </footer>
    </div>
  );
}
