import { type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...rest }: Props) {
  const inputId = id ?? rest.name;
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={`w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          error ? "border-coral-alert" : ""
        } ${className}`}
        {...rest}
      />
      {error && <span className="mt-1 block text-caption text-coral-alert">{error}</span>}
    </label>
  );
}
