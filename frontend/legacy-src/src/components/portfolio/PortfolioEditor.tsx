import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import type { PortfolioItem, PortfolioItemCreate } from "../../features/portfolio";
import { useCreatePortfolioItem, useUpdatePortfolioItem, useUploadMedia, useDeleteMedia } from "../../features/portfolio";
import { notifySuccess, notifyError } from "../../hooks/useToast";
import { getMediaUrl } from "../../utils/media";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";

interface PortfolioEditorProps {
  item?: PortfolioItem | null;
  onClose: () => void;
}

export function PortfolioEditor({ item, onClose }: PortfolioEditorProps) {
  const isEditing = !!item;
  const createMutation = useCreatePortfolioItem();
  const updateMutation = useUpdatePortfolioItem();
  const uploadMediaMutation = useUploadMedia();
  const deleteMediaMutation = useDeleteMedia();
  
  const [mediaPreviews, setMediaPreviews] = useState<{url: string, file?: File, id?: string, type: string}[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<PortfolioItemCreate>({
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

  const { register, handleSubmit, reset, watch, setValue } = methods;
  const { markClean } = useUnsavedChanges(methods as any);

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
      const existingMedia = item.media?.map(m => ({
        id: m.id,
        url: getMediaUrl(m.file_path),
        type: m.media_type
      })) || [];
      setMediaPreviews(existingMedia);
    }
  }, [item, reset]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      file,
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));

    setMediaPreviews(prev => [...prev, ...newPreviews]);

    if (isEditing && item) {
      files.forEach(async (file) => {
        setUploadingMedia(true);
        try {
          await uploadMediaMutation.mutateAsync({ id: item.id, file });
        } finally {
          setUploadingMedia(false);
        }
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = (index: number) => {
    const target = mediaPreviews[index];
    if (target.id) {
       deleteMediaMutation.mutate(target.id);
    }
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PortfolioItemCreate) => {
    const payload = { ...data };
    delete payload.cover_image;

    if (isEditing && item) {
      updateMutation.mutate({ id: item.id, data: payload }, {
        onSuccess: () => {
          markClean();
          onClose();
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: (newItem) => {
          markClean();
          const pendingFiles = mediaPreviews.filter(m => m.file).map(m => m.file as File);
          if (pendingFiles.length > 0) {
            setUploadingMedia(true);
            Promise.all(pendingFiles.map(file => 
              uploadMediaMutation.mutateAsync({ id: newItem.id, file })
            )).then(() => {
              notifySuccess("Project added to portfolio");
              onClose();
            }).catch(() => {
              notifyError("Project created but some media failed to upload");
              onClose();
            });
          } else {
            notifySuccess("Project added to portfolio");
            onClose();
          }
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
                className="w-full h-11 px-4 rounded-xl border-gray-200 focus:border-signal-blue focus:ring-signal-blue text-sm shadow-sm"
                placeholder="e.g., Summer Fashion Campaign"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Client / Brand</label>
                <input 
                  {...register("client_name")}
                  className="w-full h-11 px-4 rounded-xl border-gray-200 focus:border-signal-blue focus:ring-signal-blue text-sm shadow-sm"
                  placeholder="Brand Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Campaign Type</label>
                <input 
                  {...register("campaign_type")}
                  className="w-full h-11 px-4 rounded-xl border-gray-200 focus:border-signal-blue focus:ring-signal-blue text-sm shadow-sm"
                  placeholder="e.g., Product Launch, Review"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Description</label>
              <textarea 
                {...register("description")}
                rows={4}
                className="w-full p-4 rounded-xl border-gray-200 focus:border-signal-blue focus:ring-signal-blue text-sm shadow-sm resize-none"
                placeholder="Describe your role and the impact of the campaign..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="featured" 
                {...register("featured")}
                className="w-5 h-5 rounded border-gray-300 text-signal-blue focus:ring-signal-blue"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-900">Feature this project on my profile (Max 3)</label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Media Gallery</label>
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {mediaPreviews.map((media, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      {media.type === 'video' ? (
                        <video src={media.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={media.url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-signal-blue hover:text-signal-blue transition-colors"
                  >
                    <Upload size={24} className="mb-2" />
                    <span className="text-xs font-medium text-center px-2">Add Photo/Video</span>
                  </button>
                </div>
                {uploadingMedia && <p className="text-xs text-gray-500 text-center">Uploading...</p>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
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
            className="px-6 h-11 rounded-xl text-sm font-bold bg-signal-blue text-white hover:bg-signal-blue/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Project"}
          </button>
        </div>
      </div>
    </div>
  );
}