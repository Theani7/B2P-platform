"use client";

import { useEffect, useState } from "react";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import {
  useBusinessProfile,
  useCreateBusinessProfile,
  useUpdateBusinessProfile,
  type BusinessProfileInput,
} from "@/features/profile/api";

export function BusinessProfileForm() {
  const { data: profile, isLoading } = useBusinessProfile();
  const createMutation = useCreateBusinessProfile();
  const updateMutation = useUpdateBusinessProfile();
  const [form, setForm] = useState<BusinessProfileInput>({});
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setHasProfile(true);
      setForm({
        companyName: profile.companyName,
        industry: profile.industry,
        description: profile.description,
        location: profile.location,
        website: profile.website,
        logoUrl: profile.logoUrl,
        companySize: profile.companySize,
      });
    }
  }, [profile]);

  if (isLoading) return <p className="text-body text-steel">Loading…</p>;

  const set =
    (k: keyof BusinessProfileInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mutation = hasProfile ? updateMutation : createMutation;
    mutation.mutate(form, {
      onSuccess: () => notifySuccess(hasProfile ? "Profile updated" : "Profile created"),
      onError: (err: any) => notifyError(err?.response?.data?.message ?? "Something went wrong"),
    });
  };

  return (
    <Card>
      <PageHeader
        title={hasProfile ? "Edit business profile" : "Create business profile"}
        subtitle="Tell promoters about your brand."
      />
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input
          label="Company name"
          name="companyName"
          value={form.companyName ?? ""}
          onChange={set("companyName")}
          required
        />
        <Input label="Industry" name="industry" value={form.industry ?? ""} onChange={set("industry")} required />
        <label className="block">
          <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">
            Description
          </span>
          <textarea
            name="description"
            value={form.description ?? ""}
            onChange={set("description")}
            rows={4}
            className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Location" name="location" value={form.location ?? ""} onChange={set("location")} />
          <Input label="Website" name="website" value={form.website ?? ""} onChange={set("website")} />
          <Input label="Logo URL" name="logoUrl" value={form.logoUrl ?? ""} onChange={set("logoUrl")} />
          <Input label="Company size" name="companySize" value={form.companySize ?? ""} onChange={set("companySize")} />
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
