"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { notifySuccess, notifyError } from "@/lib/notify";
import { useCreateSocialLink, useUpdateSocialLink, type SocialLink } from "@/features/social/api";
import { Link2 } from "lucide-react";
import {
  InstagramLogo,
  TiktokLogo,
  YoutubeLogo,
  FacebookLogo,
  XLogo,
  LinkedinLogo,
} from "@phosphor-icons/react";

export const SOCIAL_PLATFORMS = [
  { key: "INSTAGRAM", label: "Instagram", icon: InstagramLogo },
  { key: "TIKTOK", label: "TikTok", icon: TiktokLogo },
  { key: "YOUTUBE", label: "YouTube", icon: YoutubeLogo },
  { key: "FACEBOOK", label: "Facebook", icon: FacebookLogo },
  { key: "X", label: "X", icon: XLogo },
  { key: "LINKEDIN", label: "LinkedIn", icon: LinkedinLogo },
] as const;

export type SocialPlatformKey = (typeof SOCIAL_PLATFORMS)[number]["key"];

export function profileUrlFor(platform: string, username: string): string {
  const u = username.trim().replace(/^@+/, "");
  switch (platform) {
    case "INSTAGRAM": return `https://instagram.com/${u}`;
    case "TIKTOK": return `https://tiktok.com/@${u}`;
    case "YOUTUBE": return `https://youtube.com/@${u}`;
    case "FACEBOOK": return `https://facebook.com/${u}`;
    case "X": return `https://x.com/${u}`;
    case "LINKEDIN": return `https://linkedin.com/in/${u}`;
    default: return "";
  }
}

export function SocialEditor({ link, onDone }: { link?: SocialLink; onDone: () => void }) {
  const create = useCreateSocialLink();
  const update = useUpdateSocialLink();
  const [platform, setPlatform] = useState<string>(link?.platform ?? "INSTAGRAM");
  const [username, setUsername] = useState(link?.username ?? "");

  useEffect(() => {
    if (link) {
      setPlatform(link.platform);
      setUsername(link.username ?? "");
    }
  }, [link]);

  const preview = username.trim() ? profileUrlFor(platform, username) : "";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      notifyError("Enter your username");
      return;
    }
    const payload = { platform, username: username.trim() };
    if (link) {
      update.mutate(
        { id: link.id, data: payload },
        { onSuccess: () => { notifySuccess("Link updated"); onDone(); }, onError: (e: any) => notifyError(e?.response?.data?.message ?? "Update failed") },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => { notifySuccess("Link added"); onDone(); },
        onError: (e: any) => notifyError(e?.response?.data?.message ?? "Create failed"),
      });
    }
  };

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div>
        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-graphite">Platform</span>
        <div className="grid grid-cols-3 gap-2">
          {SOCIAL_PLATFORMS.map((p) => {
            const active = platform === p.key;
            const disabled = !!link && link.platform !== p.key;
            return (
              <button
                key={p.key}
                type="button"
                disabled={disabled}
                onClick={() => setPlatform(p.key)}
                className={`flex items-center gap-2 rounded-inputs border p-3 text-sm font-medium transition-all ${
                  active
                    ? "border-signal-blue bg-sky-wash/50 text-signal-blue ring-2 ring-signal-blue/20"
                    : "border-slate-custom/20 bg-white text-graphite hover:border-signal-blue hover:bg-sky-wash/30"
                } ${disabled ? "cursor-not-allowed opacity-40 hover:border-slate-custom/20 hover:bg-white" : ""}`}
              >
                {(() => {
                  const Glyph = p.icon;
                  return <Glyph size={18} weight="duotone" />;
                })()}
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
      <Input
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="@handle"
        required
      />
      {preview && (
        <p className="flex items-center gap-1.5 text-xs text-ash">
          <Link2 size={12} className="flex-shrink-0" />
          <span className="truncate">{preview}</span>
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {link ? "Save changes" : "Add link"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
