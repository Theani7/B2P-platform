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
      color: "signal-blue",
    },
    {
      value: "PROMOTER" as const,
      icon: UserCircle,
      title: "Promoter",
      subtitle: "Build your portfolio and grow",
      description: "Build your portfolio, discover campaigns, and grow your audience.",
      color: "emerald-status",
    },
  ];

  return (
    <div className="mb-6">
      <label className="block text-xs font-medium text-graphite mb-3">I am a...</label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = role === option.value;
          const Icon = option.icon;
          const activeClasses =
            option.value === "BUSINESS"
              ? "border-signal-blue bg-sky-wash shadow-product-card-sm"
              : "border-emerald-status bg-emerald-status/10 shadow-product-card-sm";

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`relative flex flex-col rounded-inputs border p-5 text-left transition-all duration-200 hover:border-slate-custom/20 hover:shadow-product-card-sm ${
                isSelected ? activeClasses : "border-slate-custom/10 bg-white"
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="activeRoleIndicator"
                  className={`absolute inset-0 rounded-inputs border-2 pointer-events-none ${
                    option.value === "BUSINESS" ? "border-signal-blue" : "border-emerald-status"
                  }`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <div className="relative z-10">
                <span
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-button mb-3 ${
                    isSelected
                      ? option.value === "BUSINESS"
                        ? "bg-signal-blue text-white"
                        : "bg-emerald-status text-white"
                      : "bg-sky-wash text-steel"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <p
                  className={`text-sm font-medium mb-1 ${
                    isSelected ? "text-graphite" : "text-graphite"
                  }`}
                >
                  {option.title}
                </p>
<p className="text-xs text-steel leading-relaxed">
                   {option.description}
                 </p>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-coral-alert mt-2">Please select a role</p>}
    </div>
  );
}
