"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { useFollowStatus, useFollow, useUnfollow } from "@/features/follows/api";

export function FollowButton({ userId, className = "" }: { userId: string; className?: string }) {
  const { user } = useAuth();
  const { data: status } = useFollowStatus(userId);
  const follow = useFollow();
  const unfollow = useUnfollow();

  // Hidden for logged-out visitors (follow requires auth) and on your own profile.
  if (!userId || !user || user.id === userId) return null;

  const isFollowing = status?.isFollowing ?? false;
  const pending = follow.isPending || unfollow.isPending;
  const followersCount = status?.followersCount;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={isFollowing ? "ghost" : "primary"}
        disabled={pending}
        onClick={() => (isFollowing ? unfollow.mutate(userId) : follow.mutate(userId))}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
      {typeof followersCount === "number" && (
        <span className="text-sm text-ash">
          {followersCount.toLocaleString()} follower{followersCount === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
