import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useCreateSocialLink, useUpdateSocialLink } from "../../features/social";
import type { SocialLink, SocialLinkCreate } from "../../features/social";

interface SocialEditorProps {
  item?: SocialLink | null;
  onClose: () => void;
}

const PLATFORMS = ["INSTAGRAM", "TIKTOK", "YOUTUBE", "FACEBOOK", "LINKEDIN", "X", "GITHUB", "WEBSITE"];

export function SocialEditor({ item, onClose }: SocialEditorProps) {
  const isEditing = !!item;
  const createMutation = useCreateSocialLink();
  const updateMutation = useUpdateSocialLink();
  
  const { register, handleSubmit, reset } = useForm<SocialLinkCreate>({
    defaultValues: {
      platform: "Instagram",
      username: "",
      url: "",
    }
  });

  useEffect(() => {
    if (item) {
      reset({
        platform: item.platform,
        username: item.username,
        url: item.url,
      });
    }
  }, [item, reset]);

  const onSubmit = (data: SocialLinkCreate) => {
    if (isEditing && item) {
      updateMutation.mutate({ id: item.id, data }, { onSuccess: () => onClose() });
    } else {
      createMutation.mutate(data, { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Social Link" : "Add Social Link"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form id="social-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Platform</label>
              <select 
                {...register("platform", { required: true })}
                className="w-full h-11 px-4 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500 text-sm shadow-sm"
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Username / Handle</label>
              <input 
                {...register("username", { required: true })}
                className="w-full h-11 px-4 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500 text-sm shadow-sm"
                placeholder="e.g., @johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Profile URL</label>
              <input 
                {...register("url", { required: true })}
                className="w-full h-11 px-4 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500 text-sm shadow-sm"
                placeholder="https://..."
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 h-11 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="social-form"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 h-11 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
