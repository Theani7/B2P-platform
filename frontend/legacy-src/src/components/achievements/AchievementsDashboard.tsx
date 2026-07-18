import React, { useState, useMemo } from "react";
import { useMyAchievements } from "../../features/achievements";
import { AchievementCard } from "./AchievementCard";
import { ProgressBadge } from "./ProgressBadge";
import LoadingSpinner from "../LoadingSpinner";

export function AchievementsDashboard() {
  const { data, isLoading } = useMyAchievements();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const filteredAchievements = useMemo(() => {
    if (!data?.achievements) return [];
    
    return data.achievements.filter(ua => {
      if (filter === "unlocked") return !!ua.earned_at;
      if (filter === "locked") return !ua.earned_at;
      return true;
    });
  }, [data, filter]);

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <div className="text-gray-500">Failed to load achievements.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Your Achievements</h2>
        <p className="text-sm text-gray-500 mb-6">Complete milestones to unlock badges and level up your creator rank.</p>
        
        <ProgressBadge levelInfo={data.level_info} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-6 bg-gray-100 p-1 rounded-lg inline-flex">
          {(["all", "unlocked", "locked"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors capitalize ${
                filter === f 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(ua => (
            <AchievementCard key={ua.id} userAchievement={ua} />
          ))}
        </div>
        
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No achievements found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
