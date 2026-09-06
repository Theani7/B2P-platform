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
  Heart,
  FirstAid,
  GraduationCap,
  FilmStrip,
  Coins,
  MusicNotes,
  Palette,
  Camera,
  Tag,
  IconProps,
} from "@phosphor-icons/react";

export function getNicheIcon(niche?: string, props: IconProps = {}) {
  const norm = (niche || "").toUpperCase().trim().replace(/[\s-]+/g, "_");
  switch (norm) {
    case "LIFESTYLE":
      return <Sparkle weight="bold" {...props} />;
    case "TECH":
    case "TECHNOLOGY":
      return <Laptop weight="bold" {...props} />;
    case "FASHION":
      return <TShirt weight="bold" {...props} />;
    case "FOOD":
    case "FOOD_BEVERAGE":
    case "FOOD_AND_BEVERAGE":
      return <ForkKnife weight="bold" {...props} />;
    case "TRAVEL":
      return <AirplaneTilt weight="bold" {...props} />;
    case "FITNESS":
      return <Barbell weight="bold" {...props} />;
    case "GAMING":
      return <GameController weight="bold" {...props} />;
    case "BUSINESS":
      return <Briefcase weight="bold" {...props} />;
    case "BEAUTY":
      return <Heart weight="bold" {...props} />;
    case "HEALTH":
    case "WELLNESS":
      return <FirstAid weight="bold" {...props} />;
    case "EDUCATION":
      return <GraduationCap weight="bold" {...props} />;
    case "ENTERTAINMENT":
      return <FilmStrip weight="bold" {...props} />;
    case "FINANCE":
      return <Coins weight="bold" {...props} />;
    case "MUSIC":
      return <MusicNotes weight="bold" {...props} />;
    case "ART":
    case "DESIGN":
      return <Palette weight="bold" {...props} />;
    case "PHOTOGRAPHY":
      return <Camera weight="bold" {...props} />;
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
