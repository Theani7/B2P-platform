import { type ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-cards bg-white p-6 shadow-product-card ${className}`}>{children}</div>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "signal" | "emerald" | "coral" | "amber";
}) {
  const tones: Record<string, string> = {
    slate: "bg-steel/10 text-steel",
    signal: "bg-primary/10 text-primary",
    emerald: "bg-emerald-status/10 text-emerald-status",
    coral: "bg-coral-alert/10 text-coral-alert",
    amber: "bg-amber-tag/10 text-amber-tag",
  };
  return (
    <span className={`inline-block rounded-badges px-2 py-0.5 text-caption font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-midnight-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-body text-slate-custom">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
