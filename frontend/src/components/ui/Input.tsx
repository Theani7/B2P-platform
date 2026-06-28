import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = "", id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const helperId = helperText && !error && inputId ? `${inputId}-helper` : undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-stone-900">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-stone-900 placeholder-stone-900 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo ${
          error ? "border-brand-coral focus:border-brand-indigo focus:ring-brand-indigo" : "border-stone-100"
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={errorId || helperId}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-brand-coral" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-stone-900">
          {helperText}
        </p>
      )}
    </div>
  );
}