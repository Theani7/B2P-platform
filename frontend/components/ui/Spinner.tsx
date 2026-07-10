import { SkeletonPage, Skeleton } from "./Skeleton";

export function Spinner({ full = false }: { full?: boolean }) {
  if (full) {
    return (
      <div className="min-h-screen bg-linen-canvas flex items-start justify-center">
        <SkeletonPage />
      </div>
    );
  }

  // For inline loading (e.g. lists, dashboard sections)
  return (
    <div className="w-full space-y-4 p-4 animate-pulse">
      <div className="h-8 w-1/3 bg-slate-custom/10 rounded-md"></div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 w-full bg-slate-custom/10 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}
