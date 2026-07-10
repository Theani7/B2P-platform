"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { useCreateSocialLink, useUpdateSocialLink, type SocialLink, type SocialLinkInput } from "@/features/social/api";

export function SocialEditor({ link, onDone }: { link?: SocialLink; onDone: () => void }) {
  const create = useCreateSocialLink();
  const update = useUpdateSocialLink();
  const [form, setForm] = useState<SocialLinkInput>({ platform: "", username: "", url: "", followersCount: undefined });

  useEffect(() => {
    if (link) {
      setForm({
        platform: link.platform,
        username: link.username ?? "",
        url: link.url,
        followersCount: link.followersCount ?? undefined,
      });
    }
  }, [link]);

  const set = (k: keyof SocialLinkInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SocialLinkInput = {
      ...form,
      followersCount: form.followersCount ? Number(form.followersCount) : undefined,
    };
    if (link) {
      update.mutate(
        { id: link.id, data: payload },
        { onSuccess: () => { toast.success("Link updated"); onDone(); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? "Update failed") },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Link added"); onDone(); },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "Create failed"),
      });
    }
  };

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Platform" value={form.platform} onChange={set("platform")} placeholder="Instagram" required />
        <Input label="Username" value={form.username ?? ""} onChange={set("username")} placeholder="@handle" />
      </div>
      <Input label="URL" type="url" value={form.url} onChange={set("url")} placeholder="https://…" required />
      <Input label="Followers" type="number" min={0} value={form.followersCount ?? ""} onChange={set("followersCount")} />
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
