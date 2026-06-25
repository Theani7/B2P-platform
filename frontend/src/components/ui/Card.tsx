import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: string;
}

export default function Card({
  children,
  className = "",
  padding = "p-6",
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
