import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useCreateSocialLink, useUpdateSocialLink } from "../../features/social";
import type { SocialLink, SocialLinkCreate } from "../../features/social";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";

interface SocialEditorProps {
  item?: SocialLink | null;
  onClose: () => void;
}

const PLATFORMS = ["INSTAGRAM", "TIKTOK", "YOUTUBE", "FACEBOOK", "LINKEDIN", "X", "GITHUB", "WEBSITE"];

export function SocialEditor({ item, onClose }: SocialEditorProps) {
  const isEditing = !!item;
  const createMutation = useCreateSocialLink();
  const updateMutation = useUpdateSocialLink();
  
  const methods = useForm<SocialLinkCreate>({
    defaultValues: {
      platform: "INSTAGRAM",
      username: "",
      url: "",
    }
  });

  const { register, handleSubmit, reset } = methods;
  const { markClean } = useUnsavedChanges(methods as any);

  useEffect(() => {
    if (item) {
      reset({
        platform: item.platform,
        username: item.username,
        url: item.url,
      });
    } else {
      reset({
        platform: "INSTAGRAM",
        username: "",
        url: "",
      });
    }
  }, [item, reset]);

  const onSubmit = (data: SocialLinkCreate) => {
    if (isEditing && item) {
      updateMutation.mutate({ id: item.id, data }, { onSuccess: () => { markClean(); onClose(); } });
    } else {
      createMutation.mutate(data, { onSuccess: () => { markClean(); onClose(); } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite/50 backdrop-blur-sm">
      <div className="bg-white rounded-cards-lg shadow-product-card-product-card w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-custom/10">
          <h2 className="text-heading text-graphite">{isEditing ? "Edit Social Link" : "Add Social Link"}</h2>
          <button onClick={onClose} className="p-2 text-ash hover:bg-sky-wash hover:text-graphite rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form id="social-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-graphite mb-1">Platform</label>
              <select 
                {...register("platform", { required: true })}
                className="w-full h-11 px-4 rounded-inputs border-slate-custom/10 focus:border-signal-blue focus:ring-signal-blue/10 text-sm shadow-product-card-sm"
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-graphite mb-1">Username / Handle</label>
              <input 
                {...register("username", { required: true })}
                className="w-full h-11 px-4 rounded-inputs border-slate-custom/10 focus:border-signal-blue focus:ring-signal-blue/10 text-sm shadow-product-card-sm"
                placeholder="e.g., @johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-graphite mb-1">Profile URL</label>
              <input 
                {...register("url", { required: true })}
                className="w-full h-11 px-4 rounded-inputs border-slate-custom/10 focus:border-signal-blue focus:ring-signal-blue/10 text-sm shadow-product-card-sm"
                placeholder="https://..."
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-custom/10 flex items-center justify-end gap-3 bg-linen-canvas">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 h-11 rounded-inputs text-sm font-semibold text-graphite hover:bg-sky-wash transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="social-form"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 h-11 rounded-inputs text-sm font-bold bg-signal-blue text-white hover:opacity-90 transition-colors shadow-product-card-sm disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
