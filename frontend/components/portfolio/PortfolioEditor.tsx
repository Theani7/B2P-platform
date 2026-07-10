"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { useCreatePortfolioItem, useUpdatePortfolioItem, type PortfolioItem, type PortfolioItemInput } from "@/features/portfolio/api";
import { X } from "lucide-react";

export function PortfolioEditor({
  item,
  onDone,
}: {
  item?: PortfolioItem;
  onDone: () => void;
}) {
  const create = useCreatePortfolioItem();
  const update = useUpdatePortfolioItem();
  const [form, setForm] = useState<PortfolioItemInput>({
    title: "",
    clientName: "",
    campaignType: "",
    description: "",
    coverImage: "",
    featured: false,
    platforms: [],
    tags: [],
  });
  const [platformText, setPlatformText] = useState("");
  const [tagText, setTagText] = useState("");

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        clientName: item.clientName ?? "",
        campaignType: item.campaignType ?? "",
        description: item.description ?? "",
        coverImage: item.coverImage ?? "",
        featured: item.featured,
        platforms: item.platforms ?? [],
        tags: item.tags ?? [],
      });
    }
  }, [item]);

  const set = (k: keyof PortfolioItemInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const addArray = (key: "platforms" | "tags", text: string, setter: (v: string) => void) => {
    const v = text.trim();
    if (!v) return;
    setForm((f) => ({ ...f, [key]: [...(f[key] ?? []), v] }));
    setter("");
  };
  const removeArray = (key: "platforms" | "tags", idx: number) =>
    setForm((f) => ({ ...f, [key]: (f[key] ?? []).filter((_, i) => i !== idx) }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, title: form.title.trim() };
    if (item) {
      update.mutate(
        { id: item.id, data: payload },
        { onSuccess: () => { toast.success("Portfolio item updated"); onDone(); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? "Update failed") },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Portfolio item added"); onDone(); },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "Create failed"),
      });
    }
  };

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <Input label="Title" value={form.title} onChange={set("title")} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Client name" value={form.clientName ?? ""} onChange={set("clientName")} />
        <Input label="Campaign type" value={form.campaignType ?? ""} onChange={set("campaignType")} />
      </div>
      <label className="block">
        <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Description</span>
        <textarea
          value={form.description ?? ""}
          onChange={set("description")}
          rows={3}
          className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <Input label="Cover image URL" value={form.coverImage ?? ""} onChange={set("coverImage")} />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!form.featured}
          onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
          className="h-4 w-4 rounded border-steel/40 text-primary"
        />
        <span className="text-body text-slate-custom">Featured</span>
      </label>

      <div>
        <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Platforms</span>
        <div className="flex gap-2">
          <input
            value={platformText}
            onChange={(e) => setPlatformText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addArray("platforms", platformText, setPlatformText))}
            placeholder="Add platform and press Enter"
            className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {(form.platforms ?? []).map((p, i) => (
            <button key={i} type="button" onClick={() => removeArray("platforms", i)} className="rounded-pill bg-sky-wash px-2 py-0.5 text-caption text-graphite hover:bg-steel/10">
              <span className="flex items-center gap-1">{p} <X size={10} /></span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1 block text-caption font-medium uppercase tracking-wide text-steel">Tags</span>
        <input
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addArray("tags", tagText, setTagText))}
          placeholder="Add tag and press Enter"
          className="w-full rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {(form.tags ?? []).map((t, i) => (
            <button key={i} type="button" onClick={() => removeArray("tags", i)} className="rounded-pill bg-steel/10 px-2 py-0.5 text-caption text-graphite hover:bg-steel/20">
              <span className="flex items-center gap-1">{t} <X size={10} /></span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {item ? "Save changes" : "Add item"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
