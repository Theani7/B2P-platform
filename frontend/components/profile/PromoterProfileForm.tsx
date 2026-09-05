"use client";

import { useEffect, useState } from "react";
import { notifySuccess, notifyError, notifyApiError } from "@/lib/notify";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import {
  usePromoterProfile,
  useCreatePromoterProfile,
  useUpdatePromoterProfile,
  type PromoterProfileInput,
} from "@/features/profile/api";
import { usePublicSettings } from "@/features/settings/api";

const FALLBACK_NICHES = ["TECH","FASHION","FOOD","TRAVEL","FITNESS","LIFESTYLE","GAMING","BUSINESS","HEALTH","EDUCATION","ENTERTAINMENT","OTHER"];

function formatNicheLabel(n: string) {
  return n.trim().replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}

export function PromoterProfileForm() {
  const { data: profile, isLoading } = usePromoterProfile();
  const createMutation = useCreatePromoterProfile();
  const updateMutation = useUpdatePromoterProfile();
  const [form, setForm] = useState<PromoterProfileInput>({});
  const [hasProfile, setHasProfile] = useState(false);
  const { data: settingsData } = usePublicSettings();
  const nicheSetting = settingsData?.find((s) => s.settingKey === "promoter_niches");
  const NICHE_OPTIONS: string[] = nicheSetting
    ? nicheSetting.settingValue.split(",").map((n: string) => n.trim()).filter(Boolean)
    : FALLBACK_NICHES;

  useEffect(() => {
    if (profile) {
      setHasProfile(true);
      setForm({
        username: profile.username,
        headline: profile.headline,
        bio: profile.bio,
        niche: profile.niche,
        niches: profile.niches?.length ? profile.niches : profile.niche ? [profile.niche] : [],
        location: profile.location,
        avatarUrl: profile.avatarUrl,
        yearsExperience: profile.yearsExperience,
      });
    }
  }, [profile]);

  if (isLoading) return <p className="text-body text-steel">Loading…</p>;

  const set =
    (k: keyof PromoterProfileInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const niches = form.niches ?? (form.niche ? [form.niche] : []);
    const payload: PromoterProfileInput = {
      ...form,
      niches,
      niche: niches[0],
      yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
    };
    const mutation = hasProfile ? updateMutation : createMutation;
    mutation.mutate(payload, {
      onSuccess: () => notifySuccess(hasProfile ? "Profile updated" : "Profile created"),
      onError: (err: any) => notifyApiError(err, "Something went wrong"),
    });
  };

  return (
    <Card>
      <PageHeader
        title={hasProfile ? "Edit promoter profile" : "Create promoter profile"}
        subtitle="Showcase your niche, reach, and experience."
      />
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Username"
            name="username"
            value={form.username ?? ""}
            onChange={set("username")}
            required
            disabled={hasProfile}
          />
          <Input label="Headline" name="headline" value={form.headline ?? ""} onChange={set("headline")} />
        </div>
        <div>
          <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">
            Niches (pick up to 3) <span className="text-coral-alert">*</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {NICHE_OPTIONS.map((opt) => {
              const selected = form.niches ?? [];
              const checked = selected.includes(opt);
              const disabled = !checked && selected.length >= 3;
              return (
                <label
                  key={opt}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-button border px-3 py-1.5 text-sm font-medium transition-colors ${checked ? "border-primary bg-sky-wash text-primary" : "border-steel/30 bg-white text-midnight-ink"} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => {
                      setForm((f) => {
                        const current = f.niches ?? (f.niche ? [f.niche] : []);
                        const next = checked
                          ? current.filter((n) => n !== opt)
                          : [...current, opt].slice(0, 3);
                        return { ...f, niches: next, niche: next[0] };
                      });
                    }}
                  />
                  {formatNicheLabel(opt)}
                </label>
              );
            })}
          </div>
          {(form.niches ?? []).length === 0 && (
            <p className="mt-1 text-xs text-coral-alert">Pick at least one niche</p>
          )}
        </div>
        <label className="block">
          <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Bio</span>
          <textarea
            name="bio"
            value={form.bio ?? ""}
            onChange={set("bio")}
            rows={4}
            className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Location" name="location" value={form.location ?? ""} onChange={set("location")} />
          <Input label="Avatar URL" name="avatarUrl" value={form.avatarUrl ?? ""} onChange={set("avatarUrl")} />
          <Input
            label="Years experience"
            name="yearsExperience"
            type="number"
            min={0}
            max={80}
            value={form.yearsExperience ?? ""}
            onChange={set("yearsExperience")}
          />
        </div>
        <div>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {hasProfile ? "Save changes" : "Create profile"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
