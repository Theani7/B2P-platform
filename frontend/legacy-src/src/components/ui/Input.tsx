import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && !error && inputId ? `${inputId}-helper` : undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-body font-medium text-graphite">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 text-sm border rounded-inputs bg-white text-midnight-ink placeholder-fog focus:outline-none focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 ${
            error ? "border-coral-alert" : "border-slate-custom/20"
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={errorId || helperId}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-coral-alert" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-graphite">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
