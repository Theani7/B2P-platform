"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { useAuth } from "@/providers/AuthProvider";
import { Card, Badge } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { Trophy, Award, Medal, Lock } from "lucide-react";
import {
  useMyAchievements,
  useAchievementsCatalog,
  useRecalculateAchievements,
  type UserAchievement,
} from "@/features/achievements/api";

function LevelCard({ levelInfo }: { levelInfo: NonNullable<ReturnType<typeof useMyAchievements>["data"]>["levelInfo"] }) {
  return (
    <div className="rounded-2xl border border-slate-custom/10 bg-white p-5 shadow-product-card-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-signal-blue to-primary-action text-white shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Level</span>
          <span className="text-xl font-black leading-none">{levelInfo.level}</span>
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-graphite">
              <Trophy size={16} className="text-signal-blue" /> Creator Level
            </h3>
            <span className="text-xs font-semibold text-steel">
              {levelInfo.currentLevelPoints} / {levelInfo.nextLevelPoints} XP
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-steel/10 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-signal-blue to-primary-action transition-all duration-1000"
              style={{ width: `${Math.round(levelInfo.progressPercentage)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ ua }: { ua: UserAchievement }) {
  const earned = !!ua.earnedAt;
  return (
    <div
      className={`relative rounded-2xl border p-5 transition-all ${
        earned ? "border-slate-custom/10 bg-white shadow-sm hover:shadow-md" : "border-dashed border-steel/20 bg-gray-50 opacity-75"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border text-2xl ${
            earned ? "border-signal-blue/20 bg-sky-wash text-signal-blue" : "border-steel/20 bg-steel/10 text-steel"
          }`}
        >
          {earned ? <Medal size={24} className="text-amber-tag" /> : <Lock size={24} className="text-steel" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <h4 className={`truncate text-sm font-bold ${earned ? "text-graphite" : "text-steel"}`}>
              {ua.achievement.title}
            </h4>
            {earned && (
              <span className="ml-2 inline-flex shrink-0 items-center rounded-full bg-sky-wash px-2 py-0.5 text-[10px] font-bold text-signal-blue">
                +{ua.achievement.points} XP
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-steel">{ua.achievement.description}</p>
          <div className="mt-3">
            {earned ? (
              <p className="text-[10px] font-medium text-steel">
                Unlocked {ua.earnedAt ? new Date(ua.earnedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""}
              </p>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium text-steel">
                  <span>Progress</span>
                  <span>{ua.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-steel/20">
                  <div className="h-full rounded-full bg-signal-blue/60 transition-all" style={{ width: `${ua.progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementsInner() {
  const { user } = useAuth();
  const { data, isLoading } = useMyAchievements();
  const { data: catalog } = useAchievementsCatalog();
  const recalc = useRecalculateAchievements();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  if (isLoading) return <Spinner />;
  if (!data) return <p className="text-steel">Failed to load achievements.</p>;

  const all = data.achievements;
  const filtered = all.filter((a) =>
    filter === "unlocked" ? !!a.earnedAt : filter === "locked" ? !a.earnedAt : true,
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 text-lg font-bold text-graphite">Your Achievements</h2>
        <p className="mb-6 text-sm text-steel">Complete milestones to unlock badges and level up your creator rank.</p>
        {data.levelInfo && <LevelCard levelInfo={data.levelInfo} />}
      </div>

      <div>
        <div className="mb-6 inline-flex rounded-lg bg-sky-wash p-1">
          {(["all", "unlocked", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                filter === f ? "bg-white text-graphite shadow-sm" : "text-steel hover:text-graphite"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ua) => (
            <AchievementCard key={ua.id ?? ua.achievementId} ua={ua} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-steel/20 bg-gray-50 py-12 text-center text-sm text-steel">
            No achievements found for this filter.
          </div>
        )}
      </div>

      {user?.role === Role.ADMIN && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() =>
              recalc.mutate(undefined, {
                onSuccess: (d) => toast.success(`Recalculated ${d.count} users`),
                onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
              })
            }
            disabled={recalc.isPending}
          >
            Recalculate (Admin)
          </Button>
        </div>
      )}

      {catalog && catalog.length > 0 && (
        <div>
          <h2 className="mb-3 mt-8 text-heading-sm font-semibold text-graphite">All badges</h2>
          <div className="flex flex-wrap gap-2">
            {catalog.map((c) => (
              <Badge key={c.id} tone="signal">
                {c.icon ?? <Award size={12} className="mr-1" />} {c.title}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <RequireAuth>
      <AchievementsInner />
    </RequireAuth>
  );
}
