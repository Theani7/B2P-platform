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
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple ${
          error ? "border-brand-coral focus:border-brand-coral focus:ring-brand-coral" : "border-gray-200"
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
        <p id={helperId} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}