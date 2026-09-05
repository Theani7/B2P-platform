"use client";

import { useFollowStatus } from "@/features/follows/api";

export function InAppFollowersCount({
  userId,
  fallback,
  className = "",
}: {
  userId: string;
  fallback?: number | null;
  className?: string;
}) {
  const { data: status } = useFollowStatus(userId);
  const count = status?.followersCount ?? fallback ?? null;
  if (count == null) return null;
  return (
    <span className={className}>
      {count.toLocaleString()} follower{count === 1 ? "" : "s"}
    </span>
  );
}
