import React from "react";

interface AvatarProps {
  initials: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  colorIndex?: number;
  className?: string;
}

const colorClasses = [
  "bg-periwinkle-glow/20 text-primary-action",
  "bg-sky-wash text-signal-blue",
  "bg-amber-tag/10 text-amber-tag",
  "bg-coral-alert/10 text-coral-alert",
  "bg-emerald-status/10 text-emerald-status",
];

const sizeClasses = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-16 h-16 text-xl",
};

export function Avatar({ initials, src, size = "md", colorIndex = 0, className = "" }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className={`rounded-images object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium ${sizeClasses[size]} ${colorClasses[colorIndex % 5]} ${className}`}
    >
      {initials}
    </div>
  );
}
