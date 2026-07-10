import React from "react";

type ButtonVariant =
  | "primary-outlined"
  | "primary-filled"
  | "secondary"
  | "ghost-teal"
  | "ghost-coral"
  | "ghost-amber"
  | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  "primary-outlined":
    "bg-white/80 border border-primary-action text-primary-action rounded-button px-5 py-2.5 text-sm font-medium hover:bg-linen-canvas transition-colors inline-flex items-center whitespace-nowrap",
  "primary-filled":
    "hero-blue-fade text-white rounded-button px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center whitespace-nowrap",
  secondary:
    "bg-white border border-slate-custom/20 text-slate-custom rounded-button px-4 py-2 text-sm font-medium hover:bg-sky-wash transition-colors inline-flex items-center whitespace-nowrap",
  "ghost-teal":
    "bg-emerald-status/10 text-emerald-status border border-emerald-status/20 rounded-button px-3 py-1.5 text-xs font-medium hover:bg-emerald-status/20 transition-colors inline-flex items-center whitespace-nowrap",
  "ghost-coral":
    "bg-coral-alert/10 text-coral-alert border border-coral-alert/20 rounded-button px-3 py-1.5 text-xs font-medium hover:bg-coral-alert/20 transition-colors inline-flex items-center whitespace-nowrap",
  "ghost-amber":
    "bg-amber-tag/10 text-amber-tag border border-amber-tag/20 rounded-button px-3 py-1.5 text-xs font-medium hover:bg-amber-tag/20 transition-colors inline-flex items-center whitespace-nowrap",
  icon:
    "p-2 rounded-button hover:bg-sky-wash text-slate-custom hover:text-signal-blue transition-colors inline-flex items-center",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary-outlined", size = "md", loading, children, className = "", disabled, ...props },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={`${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading && <span className="sr-only">Loading...</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
