import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import type { PortfolioItem, PortfolioItemCreate } from "../../features/portfolio";
import { useCreatePortfolioItem, useUpdatePortfolioItem } from "../../features/portfolio";

interface PortfolioEditorProps {
  item?: PortfolioItem | null;
  onClose: () => void;
}

export function PortfolioEditor({ item, onClose }: PortfolioEditorProps) {
  const isEditing = !!item;
  const createMutation = useCreatePortfolioItem();
  const updateMutation = useUpdatePortfolioItem();
  
  const { register, handleSubmit, reset, watch, setValue } = useForm<PortfolioItemCreate>({
    defaultValues: {
      title: "",
      client_name: "",
      campaign_type: "",
      description: "",
      platforms: [],
      tags: [],
      featured: false,
    }
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
    }
  }, [item, reset]);

  const onSubmit = (data: PortfolioItemCreate) => {
    if (isEditing && item) {
      updateMutation.mutate({ id: item.id, data }, {
        onSuccess: () => onClose()
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => onClose()
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
            
            {/* Note: Media upload logic would go here in a robust implementation. We focus on CRUD. */}
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
