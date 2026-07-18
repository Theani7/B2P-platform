"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import AIGenerateButton from "@/components/ui/AIGenerateButton";
import { usePublicSettings } from "@/features/settings/api";
import { CampaignStatus, CampaignVisibility, type CampaignRead, type CampaignCreatePayload } from "@/features/campaigns/types";

type FormValues = {
  title: string;
  description: string;
  category: string;
  budget: string;
  location: string;
  targetAudience: string;
  requirements: string;
  startDate: string;
  endDate: string;
  visibility: CampaignVisibility;
  status: CampaignStatus;
};

const empty: FormValues = {
  title: "",
  description: "",
  category: "",
  budget: "",
  location: "",
  targetAudience: "",
  requirements: "",
  startDate: "",
  endDate: "",
  visibility: CampaignVisibility.PUBLIC,
  status: CampaignStatus.DRAFT,
};

export function CampaignForm({
  campaign,
  submitting,
  onSubmit,
}: {
  campaign?: CampaignRead;
  submitting?: boolean;
  onSubmit: (data: CampaignCreatePayload) => void;
}) {
  const [form, setForm] = useState<FormValues>(empty);
  const { data: settings } = usePublicSettings();
  
  const categorySetting = settings?.find((s) => s.settingKey === "campaign_categories")?.settingValue;
  const categories = categorySetting ? categorySetting.split(",") : ["TECH","FASHION","FOOD","TRAVEL","FITNESS","LIFESTYLE","GAMING","BUSINESS","HEALTH","EDUCATION","ENTERTAINMENT","OTHER"];
  
  // Today's date in YYYY-MM-DD format for the min date
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (campaign) {
      setForm({
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        budget: String(campaign.budget),
        location: campaign.location,
        targetAudience: campaign.targetAudience ?? "",
        requirements: campaign.requirements ?? "",
        startDate: campaign.startDate.slice(0, 10),
        endDate: campaign.endDate.slice(0, 10),
        visibility: campaign.visibility,
        status: campaign.status,
      });
    }
  }, [campaign]);

  const set = (k: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CampaignCreatePayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      budget: Number(form.budget),
      location: form.location.trim(),
      targetAudience: form.targetAudience || undefined,
      requirements: form.requirements || undefined,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      visibility: form.visibility,
      status: form.status,
    };
    onSubmit(payload);
  };

  const aiContext = [
    form.category && `Category: ${form.category}`,
    form.budget && `Budget: $${form.budget}`,
    form.location && `Location: ${form.location}`,
    form.targetAudience && `Target Audience: ${form.targetAudience}`,
  ].filter(Boolean).join("\n");

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <Input label="Title" value={form.title} onChange={set("title")} maxLength={255} required />
      <label className="block">
        <div className="flex justify-between items-end mb-1">
          <span className="block text-caption font-medium uppercase tracking-wide text-steel">
            Description
          </span>
          <AIGenerateButton 
            title={form.title} 
            currentText={form.description}
            contextData={aiContext}
            contextType="description"
            onUpdate={(desc) => setForm(f => ({ ...f, description: desc }))} 
          />
        </div>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={4}
          minLength={20}
          maxLength={5000}
          className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <span className="mt-1 block text-caption text-steel">Minimum 20 characters.</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Category</span>
          <select
            value={form.category}
            onChange={set("category")}
            required
            className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <Input label="Budget" type="number" min={1} max={1000000000} value={form.budget} onChange={set("budget")} required />
        <Input label="Location" value={form.location} onChange={set("location")} maxLength={255} placeholder="e.g., Kathmandu, Nepal or Online" required />
        <label className="block">
          <div className="flex justify-between items-end mb-1">
            <span className="block text-caption font-medium uppercase tracking-wide text-steel">Target Audience</span>
            <AIGenerateButton 
              title={form.title} 
              currentText={form.targetAudience}
              contextData={aiContext}
              contextType="target audience"
              onUpdate={(ta) => setForm(f => ({ ...f, targetAudience: ta }))} 
            />
          </div>
          <input
            type="text"
            value={form.targetAudience}
            onChange={set("targetAudience")}
            maxLength={5000}
            className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>
      <label className="block">
        <div className="flex justify-between items-end mb-1">
          <span className="block text-caption font-medium uppercase tracking-wide text-steel">
            Requirements
          </span>
          <AIGenerateButton 
            title={form.title} 
            currentText={form.requirements}
            contextData={aiContext}
            contextType="requirements"
            onUpdate={(req) => setForm(f => ({ ...f, requirements: req }))} 
          />
        </div>
        <textarea
          value={form.requirements}
          onChange={set("requirements")}
          rows={3}
          maxLength={5000}
          className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Start date" type="date" min={today} value={form.startDate} onChange={set("startDate")} required />
        <Input label="End date" type="date" min={form.startDate || today} value={form.endDate} onChange={set("endDate")} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Visibility</span>
          <select
            value={form.visibility}
            onChange={set("visibility")}
            className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value={CampaignVisibility.PUBLIC}>Public</option>
            <option value={CampaignVisibility.PRIVATE}>Private</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Status</span>
          <select
            value={form.status}
            onChange={set("status")}
            className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value={CampaignStatus.DRAFT}>Draft</option>
            <option value={CampaignStatus.OPEN}>Open</option>
          </select>
        </label>
      </div>
      <div>
        <Button type="submit" disabled={submitting}>
          {campaign ? "Save changes" : "Create campaign"}
        </Button>
      </div>
    </form>
  );
}
