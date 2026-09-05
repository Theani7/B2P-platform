"use client";

import React from "react";
import {
  Sparkle,
  Laptop,
  TShirt,
  ForkKnife,
  AirplaneTilt,
  Barbell,
  GameController,
  Briefcase,
  Tag,
  IconProps,
} from "@phosphor-icons/react";

export function getNicheIcon(niche?: string, props: IconProps = {}) {
  const norm = (niche || "").toUpperCase().trim();
  switch (norm) {
    case "LIFESTYLE":
      return <Sparkle weight="bold" {...props} />;
    case "TECH":
      return <Laptop weight="bold" {...props} />;
    case "FASHION":
      return <TShirt weight="bold" {...props} />;
    case "FOOD":
      return <ForkKnife weight="bold" {...props} />;
    case "TRAVEL":
      return <AirplaneTilt weight="bold" {...props} />;
    case "FITNESS":
      return <Barbell weight="bold" {...props} />;
    case "GAMING":
      return <GameController weight="bold" {...props} />;
    case "BUSINESS":
      return <Briefcase weight="bold" {...props} />;
    default:
      return <Tag weight="bold" {...props} />;
  }
}

export function NicheBadge({ niche, className = "" }: { niche?: string; className?: string }) {
  if (!niche) return null;
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-inputs text-[11px] font-bold tracking-wider uppercase bg-sky-wash text-graphite border border-slate-custom/10 shadow-sm ${className}`}
    >
      {getNicheIcon(niche, { size: 13, className: "text-signal-blue" })}
      <span>{niche}</span>
    </div>
  );
}
