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
        <label htmlFor={textareaId} className="block text-sm font-medium text-graphite">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-3 py-2 text-sm border rounded-inputs bg-white text-graphite placeholder-ash focus:outline-none focus:border-signal-blue focus:ring-signal-blue/10 ${
          error ? "border-coral-alert focus:border-signal-blue focus:ring-signal-blue/10" : "border-slate-custom/10"
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-coral-alert" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
