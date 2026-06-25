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
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Social Accounts</h3>
          <p className="text-sm text-gray-500">Connect your social media accounts to showcase your audience to brands.</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsEditorOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-primary-600 text-white h-10 px-4 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Social
        </button>
      </div>
      
      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {items?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-sm font-medium text-gray-900">No social links yet.</p>
              <p className="text-xs text-gray-500 mt-1">Add your platforms to build credibility.</p>
            </div>
          ) : (
            items?.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-primary-100 hover:shadow-sm transition-all group">
                <div className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600">
                  <GripVertical size={18} />
                </div>
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm
                  ${item.platform.toLowerCase() === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' :
                    item.platform.toLowerCase() === 'youtube' ? 'bg-red-500' :
                    item.platform.toLowerCase() === 'twitter' || item.platform.toLowerCase() === 'x' ? 'bg-black' :
                    item.platform.toLowerCase() === 'linkedin' ? 'bg-blue-600' :
                    item.platform.toLowerCase() === 'facebook' ? 'bg-blue-500' :
                    'bg-gray-800'
                  }
                `}>
                  <SocialIcon platform={item.platform} size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">{item.platform}</h4>
                    {item.is_verified && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-primary-600 truncate block mt-0.5">
                    {item.username}
                  </a>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
