import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", id, ...props }: TextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const errorId = error && textareaId ? `${textareaId}-error` : undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo ${
          error ? "border-brand-coral focus:border-brand-indigo focus:ring-brand-indigo" : "border-gray-200"
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-brand-coral" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}