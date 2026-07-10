"use client";

import { useEffect, useState } from "react";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import {
  usePromoterProfile,
  useCreatePromoterProfile,
  useUpdatePromoterProfile,
  type PromoterProfileInput,
} from "@/features/profile/api";

export function PromoterProfileForm() {
  const { data: profile, isLoading } = usePromoterProfile();
  const createMutation = useCreatePromoterProfile();
  const updateMutation = useUpdatePromoterProfile();
  const [form, setForm] = useState<PromoterProfileInput>({});
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setHasProfile(true);
      setForm({
        username: profile.username,
        headline: profile.headline,
        bio: profile.bio,
        niche: profile.niche,
        location: profile.location,
        avatarUrl: profile.avatarUrl,
        followersCount: profile.followersCount,
        engagementRate: profile.engagementRate,
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
    const payload: PromoterProfileInput = {
      ...form,
      followersCount: form.followersCount ? Number(form.followersCount) : undefined,
      engagementRate: form.engagementRate ? Number(form.engagementRate) : undefined,
      yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
    };
    const mutation = hasProfile ? updateMutation : createMutation;
    mutation.mutate(payload, {
      onSuccess: () => notifySuccess(hasProfile ? "Profile updated" : "Profile created"),
      onError: (err: any) => notifyError(err?.response?.data?.message ?? "Something went wrong"),
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
        <Input label="Niche" name="niche" value={form.niche ?? ""} onChange={set("niche")} required />
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
            label="Followers"
            name="followersCount"
            type="number"
            min={0}
            max={1000000000}
            value={form.followersCount ?? ""}
            onChange={set("followersCount")}
          />
          <Input
            label="Engagement rate (%)"
            name="engagementRate"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={form.engagementRate ?? ""}
            onChange={set("engagementRate")}
          />
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
