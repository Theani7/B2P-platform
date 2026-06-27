import { motion } from "framer-motion";
import { Building2, UserCircle } from "lucide-react";

interface RoleSelectorProps {
  role: "BUSINESS" | "PROMOTER" | null;
  onSelect: (role: "BUSINESS" | "PROMOTER") => void;
  error?: boolean;
}

export default function RoleSelector({ role, onSelect, error }: RoleSelectorProps) {
  const options = [
    {
      value: "BUSINESS" as const,
      icon: Building2,
      title: "Business",
      subtitle: "Run campaigns and find creators",
      description: "Create campaigns, discover promoters, and manage collaborations.",
      color: "brand-purple",
    },
    {
      value: "PROMOTER" as const,
      icon: UserCircle,
      title: "Promoter",
      subtitle: "Build your portfolio and grow",
      description: "Build your portfolio, discover campaigns, and grow your audience.",
      color: "brand-teal",
    },
  ];

  return (
    <div className="mb-6">
      <label className="block text-xs font-medium text-gray-700 mb-3">I am a...</label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = role === option.value;
          const Icon = option.icon;
          const activeClasses =
            option.value === "BUSINESS"
              ? "border-brand-purple bg-brand-purple-50 shadow-sm"
              : "border-brand-teal bg-brand-teal-50 shadow-sm";

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`relative flex flex-col rounded-xl border p-5 text-left transition-all duration-200 hover:border-gray-300 hover:shadow-sm ${
                isSelected ? activeClasses : "border-gray-200 bg-white"
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="activeRoleIndicator"
                  className="absolute inset-0 rounded-xl border-2"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <div className="relative z-10">
                <span
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${
                    isSelected
                      ? option.value === "BUSINESS"
                        ? "bg-brand-purple text-white"
                        : "bg-brand-teal text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <p
                  className={`text-sm font-medium mb-1 ${
                    isSelected ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {option.title}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-brand-coral mt-2">Please select a role</p>}
    </div>
  );
}
