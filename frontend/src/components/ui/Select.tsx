import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, helperText, options, placeholder, className = "", id, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const errorId = error && selectId ? `${selectId}-error` : undefined;
  const helperId = helperText && !error && selectId ? `${selectId}-helper` : undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple ${
          error ? "border-brand-coral focus:border-brand-coral focus:ring-brand-coral" : "border-gray-200"
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={errorId || helperId}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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