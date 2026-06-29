import React, { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, CheckCircle2 } from "lucide-react";
import { useMySocialLinks, useDeleteSocialLink } from "../../features/social";
import { SocialIcon } from "./SocialIcon";
import { SocialEditor } from "./SocialEditor";
import type { SocialLink } from "../../features/social";

export function SocialSettings() {
  const { data: items, isLoading } = useMySocialLinks();
  const deleteMutation = useDeleteSocialLink();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SocialLink | null>(null);

  const handleEdit = (item: SocialLink) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this social link?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-cards shadow-product-card-product-card p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-heading text-graphite mb-2">Social Accounts</h3>
          <p className="text-sm text-fog">Connect your social media accounts to showcase your audience to brands.</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsEditorOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-signal-blue text-white h-10 px-4 rounded-button text-sm font-semibold hover:opacity-90 transition-colors shadow-product-card-sm"
        >
          <Plus size={16} /> Add Social
        </button>
      </div>
      
      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-signal-blue/20 border-t-signal-blue rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {items?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-linen-canvas rounded-cards border border-dashed border-slate-custom/10">
              <p className="text-sm font-medium text-graphite">No social links yet.</p>
              <p className="text-xs text-ash mt-1 mb-4">Add your platforms to build credibility.</p>
              <button 
                onClick={() => {
                  setEditingItem(null);
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-white border border-slate-custom/10 text-graphite h-9 px-4 rounded-inputs text-sm font-semibold hover:bg-sky-wash transition-colors shadow-product-card-sm"
              >
                <Plus size={16} /> Add Social Link
              </button>
            </div>
          ) : (
            items?.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-inputs border border-slate-custom/10 bg-white hover:border-signal-blue/20 hover:shadow-product-card-sm transition-all group">
                <div className="text-ash cursor-grab active:cursor-grabbing hover:text-graphite">
                  <GripVertical size={18} />
                </div>
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-product-card-sm
                  ${item.platform.toLowerCase() === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' :
                    item.platform.toLowerCase() === 'youtube' ? 'bg-coral-alert' :
                    item.platform.toLowerCase() === 'twitter' || item.platform.toLowerCase() === 'x' ? 'bg-graphite' :
                    item.platform.toLowerCase() === 'linkedin' ? 'bg-signal-blue' :
                    item.platform.toLowerCase() === 'facebook' ? 'bg-signal-blue' :
                    'bg-graphite'
                  }
                `}>
                  <SocialIcon platform={item.platform} size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-graphite">{item.platform}</h4>
                    {item.is_verified && <CheckCircle2 size={14} className="text-emerald-status" />}
                  </div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-ash hover:text-signal-blue truncate block mt-0.5">
                    {item.username}
                  </a>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(item)} className="p-2 text-ash hover:text-signal-blue hover:bg-signal-blue/10 rounded-button transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-ash hover:text-coral-alert hover:bg-coral-alert/10 rounded-button transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isEditorOpen && (
        <SocialEditor 
          item={editingItem} 
          onClose={() => {
            setIsEditorOpen(false);
            setEditingItem(null);
          }} 
        />
      )}
    </div>
  );
}
