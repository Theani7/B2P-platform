"use client";

import { Star } from "lucide-react";

export function RatingStars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "text-body" : "text-heading-sm";
  return (
    <span className={`inline-flex items-center gap-0.5 ${cls}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return onChange ? (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            className={`leading-none transition ${filled ? "text-amber-tag" : "text-steel/40"} hover:text-amber-tag`}
          >
            <Star size={size === "sm" ? 14 : 20} className="fill-current" />
          </button>
        ) : (
          <span key={n} className={`leading-none ${filled ? "text-amber-tag" : "text-steel/30"}`}>
            <Star size={size === "sm" ? 14 : 20} className="fill-current" />
          </span>
        );
      })}
    </span>
  );
}
