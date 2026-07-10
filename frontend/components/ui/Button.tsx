import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger" | "subtle";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary: "bg-primary text-white hover:opacity-90",
  ghost: "border border-steel/40 text-graphite hover:bg-sky-wash",
  danger: "bg-coral-alert text-white hover:opacity-90",
  subtle: "bg-sky-wash text-graphite hover:bg-steel/10",
};

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-buttons px-4 py-2 text-body font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...rest}
    />
  );
}
