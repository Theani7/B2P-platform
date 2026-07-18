import React from "react";
import { toast } from "react-hot-toast";
import { Trophy } from "lucide-react";
import type { Achievement } from "../../features/achievements";

export const notifyAchievement = (achievement: Achievement) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden border border-primary-100`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-primary-500/20">
              <Trophy className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
              🎉 Achievement Unlocked!
            </p>
            <p className="text-sm font-bold text-gray-900">
              {achievement.title}
            </p>
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">
              {achievement.description}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex items-center h-full">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-black bg-primary-500 text-white shadow-inner">
              +{achievement.points} XP
            </span>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-100">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  ), { duration: 5000 });
};
