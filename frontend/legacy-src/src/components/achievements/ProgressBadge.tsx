import React from "react";
import type { UserLevelInfo } from "../../features/achievements";
import { Trophy } from "lucide-react";

interface ProgressBadgeProps {
  levelInfo: UserLevelInfo;
}

export function ProgressBadge({ levelInfo }: ProgressBadgeProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex flex-col items-center justify-center shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Level</span>
          <span className="text-xl font-black leading-none">{levelInfo.level}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Trophy size={16} className="text-primary-500" />
              Creator Level
            </h3>
            <span className="text-xs font-semibold text-gray-500">
              {levelInfo.current_level_points} / {levelInfo.next_level_points} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${levelInfo.progress_percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
