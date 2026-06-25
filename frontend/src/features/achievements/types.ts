export type BadgeCategory = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "SPECIAL";

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  points: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement: Achievement;
  earned_at: string | null;
  progress: number;
}

export interface UserLevelInfo {
  level: number;
  total_points: number;
  current_level_points: number;
  next_level_points: number;
  progress_percentage: number;
}

export interface AchievementResponse {
  achievements: UserAchievement[];
  level_info: UserLevelInfo;
}
