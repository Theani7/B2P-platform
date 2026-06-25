import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors ${
            error ? "border-danger focus:ring-danger focus:border-danger" : "border-gray-300"
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error && inputId ? `${inputId}-error` : helperText && inputId ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
