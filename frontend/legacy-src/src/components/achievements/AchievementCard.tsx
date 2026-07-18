import React from "react";
import type { UserAchievement, BadgeCategory } from "../../features/achievements";
import { format } from "date-fns";
import { Award, Star, Trophy, Shield, Zap } from "lucide-react";

interface AchievementCardProps {
  userAchievement: UserAchievement;
}

export function AchievementCard({ userAchievement }: AchievementCardProps) {
  const { achievement, earned_at, progress } = userAchievement;
  const isEarned = !!earned_at;

  const getCategoryStyles = (category: BadgeCategory) => {
    switch (category) {
      case "BRONZE": return "bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20";
      case "SILVER": return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20";
      case "GOLD": return "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500/20";
      case "PLATINUM": return "bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20";
      case "SPECIAL": return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 ring-fuchsia-500/20";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getIcon = () => {
    // We could map achievement.icon string to an actual icon, but fallback for now
    switch (achievement.category) {
      case "BRONZE": return <Star size={24} />;
      case "SILVER": return <Shield size={24} />;
      case "GOLD": return <Award size={24} />;
      case "PLATINUM": return <Trophy size={24} />;
      case "SPECIAL": return <Zap size={24} />;
      default: return <Award size={24} />;
    }
  };

  return (
    <div className={`relative p-5 rounded-2xl border transition-all ${
      isEarned 
        ? "bg-white border-gray-100 shadow-sm hover:shadow-md" 
        : "bg-gray-50 border-dashed border-gray-200 opacity-75"
    }`}>
      <div className="flex items-start gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl border ${
          isEarned ? getCategoryStyles(achievement.category) : "bg-gray-100 text-gray-400 border-gray-200"
        }`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className={`text-sm font-bold truncate ${isEarned ? "text-gray-900" : "text-gray-500"}`}>
              {achievement.title}
            </h4>
            {isEarned && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 whitespace-nowrap">
                +{achievement.points} XP
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{achievement.description}</p>
          
          <div className="mt-3">
            {isEarned ? (
              <p className="text-[10px] font-medium text-gray-400">
                Unlocked {format(new Date(earned_at!), "MMM d, yyyy")}
              </p>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium text-gray-400">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-300 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
