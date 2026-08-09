import { HTMLAttributes, type ReactNode } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: string;
}

export function Skeleton({ className = "", rounded = "rounded-md", ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-[linear-gradient(90deg,#eef1f6_25%,#e2e7f0_37%,#eef1f6_63%)] bg-[length:200%_100%] animate-shimmer ${rounded} ${className}`}
      {...(props as any)}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
  lastLineWidth = "w-2/3",
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 ? lastLineWidth : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-cards-lg p-6 shadow-product-card border border-slate-custom/10 ${className}`}
    >
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2 mt-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} className="mb-6" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-12 rounded-inputs" />
        <Skeleton className="h-12 rounded-inputs" />
        <Skeleton className="h-12 rounded-inputs" />
      </div>
    </div>
  );
}

export function SkeletonCards({
  count = 6,
  className = "",
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
}: {
  count?: number;
  className?: string;
  gridClassName?: string;
}) {
  return (
    <div className={`${gridClassName} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStatCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white border border-slate-custom/10 rounded-cards p-5 shadow-product-card ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-16 mt-4" />
      <Skeleton className="h-3 w-20 mt-3" />
    </div>
  );
}

export function SkeletonStats({ count = 4, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonList({
  count = 4,
  rowHeight = "h-16",
  roundedWrapper = "rounded-2xl",
  className = "",
}: {
  count?: number;
  rowHeight?: string;
  roundedWrapper?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white ${rowHeight} ${roundedWrapper} ring-1 ring-slate-custom/10 overflow-hidden`}
        >
          <div className="h-full flex items-center gap-4 px-6">
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-9 w-24 rounded-inputs" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 6,
  cols = 4,
  className = "",
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3 bg-white rounded-cards border border-slate-custom/10">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-4 ${c === 0 ? "w-1/4" : "flex-1"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfileModal({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="space-y-2">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <SkeletonStats count={4} />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <SkeletonCards count={6} />
      </div>
    </div>
  );
}

export function SkeletonInline({ label, className = "" }: { label?: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {label}
      <span className="inline-block h-4 w-16 rounded bg-[linear-gradient(90deg,#eef1f6_25%,#e2e7f0_37%,#eef1f6_63%)] bg-[length:200%_100%] animate-shimmer" />
    </span>
  );
}
