interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  colorIndex?: number;
  className?: string;
}

const colorClasses = [
  "bg-brand-purple-50 text-brand-purple-900",
  "bg-brand-teal-50 text-brand-teal-900",
  "bg-brand-amber-50 text-brand-amber-900",
  "bg-brand-coral-50 text-brand-coral-900",
  "bg-green-50 text-green-800",
];

const sizeClasses = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-16 h-16 text-xl",
};

export function Avatar({ initials, size = "md", colorIndex = 0, className = "" }: AvatarProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium ${sizeClasses[size]} ${colorClasses[colorIndex % 5]} ${className}`}
    >
      {initials}
    </div>
  );
}