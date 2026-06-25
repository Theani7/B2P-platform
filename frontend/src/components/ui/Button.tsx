import React from "react";

type ButtonVariant =
  | "primary"
  | "cta"
  | "secondary"
  | "ghost-teal"
  | "ghost-destructive"
  | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-purple text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity",
  cta: "bg-brand-indigo text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity",
  secondary: "bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
  "ghost-teal": "bg-brand-teal-50 text-brand-teal-900 border border-teal-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-teal-100 transition-colors",
  "ghost-destructive": "bg-brand-coral-50 text-brand-coral-900 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition-colors",
  icon: "p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }, ref) => {
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