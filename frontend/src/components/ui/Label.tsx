import type { LabelHTMLAttributes, ReactNode } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

const Label: React.FC<LabelProps> = ({ children, className = "", ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

export default Label;
