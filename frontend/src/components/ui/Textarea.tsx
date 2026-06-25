import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors ${
            error ? "border-danger focus:ring-danger focus:border-danger" : "border-gray-300"
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error && textareaId ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
