"use client";

import { type InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

export function Input({ label, error, success, className = "", id, type, ...rest }: Props) {
  const inputId = id ?? rest.name;
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="block w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={currentType}
          className={`w-full rounded-inputs border border-steel/30 bg-white px-3 py-2.5 text-sm text-midnight-ink outline-none transition focus:border-signal-blue focus:ring-[3px] focus:ring-signal-blue/10 ${
            error ? "border-coral-alert focus:border-coral-alert focus:ring-coral-alert/10" : success ? "border-emerald-status focus:border-emerald-status focus:ring-emerald-status/10" : ""
          } ${isPassword || success ? "pr-10" : ""} ${className}`}
          {...rest}
        />
        {success && !isPassword && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-status flex items-center justify-center pointer-events-none">
            <Check size={18} />
          </div>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword(!showPassword);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-signal-blue transition-colors focus:outline-none flex items-center justify-center"
            tabIndex={-1}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="mt-1 block text-caption text-coral-alert font-medium">{error}</span>}
    </div>
  );
}
