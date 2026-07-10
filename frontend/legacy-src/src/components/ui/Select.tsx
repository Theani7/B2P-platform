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
        <label htmlFor={selectId} className="block text-sm font-medium text-graphite">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 text-sm border rounded-inputs bg-white text-graphite focus:outline-none focus:border-signal-blue focus:ring-signal-blue/10 ${
          error ? "border-coral-alert focus:border-signal-blue focus:ring-signal-blue/10" : "border-slate-custom/10"
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
        <p id={errorId} className="text-sm text-coral-alert" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-ash">
          {helperText}
        </p>
      )}
    </div>
  );
}
