import { forwardRef, useId, type SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  id?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      options,
      placeholder,
      className = "",
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const selectId = id ?? `select-${autoId}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const describedBy = [
      error ? errorId : null,
      helperText && !error ? helperId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="space-y-1">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors outline-none ${
            error
              ? "border-danger focus:ring-danger focus:border-danger"
              : "border-gray-300 focus:ring-primary focus:border-primary"
          } focus:ring-2 ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="text-sm text-danger" role="alert">
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
  },
);

Select.displayName = "Select";

export default Select;
