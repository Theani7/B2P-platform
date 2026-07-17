import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger" | "subtle";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary: "bg-signal-blue text-white hover:bg-signal-blue/90 hover:shadow-blue-focus active:scale-[0.98] transition-all duration-200",
  ghost: "border border-slate-custom/10 bg-white text-graphite hover:bg-sky-wash hover:text-signal-blue hover:border-signal-blue/30 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md",
  danger: "bg-coral-alert text-white hover:bg-coral-alert/90 hover:shadow-[0_0_15px_rgba(242,96,82,0.3)] active:scale-[0.98] transition-all duration-200",
  subtle: "bg-sky-wash text-signal-blue hover:bg-periwinkle-glow active:scale-[0.98] transition-all duration-200",
};

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-buttons px-4 py-2 text-body font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...rest}
    />
  );
}
