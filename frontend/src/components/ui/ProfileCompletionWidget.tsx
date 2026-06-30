import { Link } from "react-router-dom";
import { CheckCircle2, Circle, AlertCircle, Sparkles } from "lucide-react";
import type { ProfileCompletionResponse } from "../../features/profile-completion";

interface ProfileCompletionWidgetProps {
  data: ProfileCompletionResponse | undefined;
  isLoading: boolean;
}

export function ProfileCompletionWidget({ data, isLoading }: ProfileCompletionWidgetProps) {
  if (isLoading) {
    return <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 h-64 animate-pulse" />;
  }

  if (!data) return null;

  const { percentage, completed_items, missing_items, next_best_action } = data;

  const getColorClass = (pct: number) => {
    if (pct < 40) return "bg-red-500 text-red-700";
    if (pct < 70) return "bg-amber-500 text-amber-700";
    if (pct < 100) return "bg-blue-500 text-blue-700";
    return "bg-emerald-500 text-emerald-700";
  };

  const colorClass = getColorClass(percentage);
  const barColor = colorClass.split(" ")[0];
  const textColor = colorClass.split(" ")[1];

  if (percentage === 100) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-sm ring-1 ring-emerald-100 p-6 flex flex-col items-center justify-center text-center min-h-[250px]">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="text-emerald-500 w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-emerald-900 mb-2">🎉 Profile Complete!</h2>
        <p className="text-sm text-emerald-700 max-w-xs">
          Your profile is fully optimized. You are ready to stand out!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-900">Profile Completion</h2>
        <span className={`text-sm font-bold ${textColor}`}>{percentage}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div 
          className={`h-full ${barColor} transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage < 20 ? (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center">
          <AlertCircle className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <p className="text-sm text-gray-600 font-medium">Complete your profile to improve your visibility.</p>
        </div>
      ) : next_best_action ? (
        <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Next Best Action</p>
          <p className="text-sm font-semibold text-blue-900">{next_best_action.title}</p>
          <p className="text-xs text-blue-700 mt-1">{next_best_action.description}</p>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto pr-2 space-y-2.5">
        {completed_items.map((item) => (
          <div key={item.key} className="flex items-center gap-2 opacity-60">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-600 line-through decoration-gray-300">{item.label}</span>
          </div>
        ))}
        {missing_items.map((item) => (
          item.route ? (
            <Link key={item.key} to={item.route} className="flex items-center gap-2 group hover:bg-gray-50 p-1 -ml-1 rounded transition-colors">
              <Circle className="w-4 h-4 text-gray-300 group-hover:text-signal-blue" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-signal-blue">{item.label}</span>
            </Link>
          ) : (
            <div key={item.key} className="flex items-center gap-2 p-1 -ml-1">
              <Circle className="w-4 h-4 text-gray-300" />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
