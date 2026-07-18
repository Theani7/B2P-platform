import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "compact" | "feature";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ padding = "md", variant = "compact", className = "", children, ...props }: CardProps) {
  const variantClasses =
    variant === "feature"
      ? "bg-linen-canvas rounded-cards-lg border-0"
      : "bg-white border border-slate-custom/10 shadow-product-card rounded-cards";

  return (
    <div className={`${paddingClasses[padding]} ${variantClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
