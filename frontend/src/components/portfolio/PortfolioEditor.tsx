import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import type { PortfolioItem, PortfolioItemCreate } from "../../features/portfolio";
import { useCreatePortfolioItem, useUpdatePortfolioItem, useUploadMedia } from "../../features/portfolio";
import { notifySuccess, notifyError } from "../../hooks/useToast";

interface PortfolioEditorProps {
  item?: PortfolioItem | null;
  onClose: () => void;
}

export function PortfolioEditor({ item, onClose }: PortfolioEditorProps) {
  const isEditing = !!item;
  const createMutation = useCreatePortfolioItem();
  const updateMutation = useUpdatePortfolioItem();
  const uploadMediaMutation = useUploadMedia();
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<PortfolioItemCreate>({
    defaultValues: {
      title: "",
      client_name: "",
      campaign_type: "",
      description: "",
      platforms: [],
      tags: [],
      featured: false,
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        title: item.title,
        client_name: item.client_name || "",
        campaign_type: item.campaign_type || "",
        description: item.description || "",
        platforms: item.platforms || [],
        tags: item.tags || [],
        featured: item.featured,
      });
      if (item.cover_image) {
        setMediaPreview(item.cover_image);
      }
    }
  }, [item, reset]);

  const handleMediaUpload = async (file: File) => {
    if (!file) return;

    if (isEditing && item) {
      setUploadingMedia(true);
      try {
        await uploadMediaMutation.mutateAsync({ id: item.id, file });
        notifySuccess("Media uploaded successfully");
      } finally {
        setUploadingMedia(false);
      }
    } else {
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
      setValue("cover_image", url);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleMediaUpload(file);
  };

  const onSubmit = async (data: PortfolioItemCreate) => {
    if (isEditing && item) {
      updateMutation.mutate({ id: item.id, data }, {
        onSuccess: () => onClose()
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: (newItem) => {
          if (data.cover_image && data.cover_image.startsWith("blob:")) {
            setUploadingMedia(true);
            uploadMediaMutation.mutate({ id: newItem.id, file: fileInputRef.current?.files?.[0] as File });
          }
          onClose();
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Project" : "Add Project"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="portfolio-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Project Title</label>
              <input 
                {...register("title", { required: true })}
                className="w-full h-11 px-4 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500 text-sm shadow-sm"
                placeholder="e.g., Summer Fashion Campaign"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Client / Brand</label>
                <input 
                  {...register("client_name")}
                  className="w-full h-11 px-4 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500 text-sm shadow-sm"
                  placeholder="Brand Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Campaign Type</label>
                <input 
                  {...register("campaign_type")}
                  className="w-full h-11 px-4 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500 text-sm shadow-sm"
                  placeholder="e.g., Product Launch, Review"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Description</label>
              <textarea 
                {...register("description")}
                rows={4}
                className="w-full p-4 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500 text-sm shadow-sm resize-none"
                placeholder="Describe your role and the impact of the campaign..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="featured" 
                {...register("featured")}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-900">Feature this project on my profile (Max 3)</label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Cover Image</label>
              <div className="border border-gray-200 rounded-xl p-4">
                {mediaPreview ? (
                  <div className="relative">
                    <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingMedia}
                      className="absolute top-2 right-2 px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
                  >
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm font-medium">Click to upload cover image</span>
                  </button>
                )}
                {uploadingMedia && <p className="text-xs text-gray-500 mt-2">Uploading...</p>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
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
            form="portfolio-form"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 h-11 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Project"}
          </button>
        </div>
      </div>
    </div>
  );
}