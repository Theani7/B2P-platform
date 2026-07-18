import { SkeletonList, SkeletonPage } from "./Skeleton";

export function Spinner({ full = false }: { full?: boolean }) {
  if (full) {
    return (
      <div className="min-h-screen bg-linen-canvas flex items-start justify-center">
        <SkeletonPage />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-4">
      <SkeletonList count={3} />
    </div>
  );
}
