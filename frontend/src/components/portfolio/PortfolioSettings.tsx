import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useMyPortfolio, useDeletePortfolioItem } from "../../features/portfolio";
import { PortfolioGrid } from "./PortfolioGrid";
import { PortfolioEditor } from "./PortfolioEditor";
import type { PortfolioItem } from "../../features/portfolio";

export function PortfolioSettings() {
  const { data: items, isLoading } = useMyPortfolio();
  const deleteMutation = useDeletePortfolioItem();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Portfolio</h3>
          <p className="text-sm text-gray-500">Showcase your past work, collaborations, and successful campaigns to brands.</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsEditorOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-primary-600 text-white h-10 px-4 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Project
        </button>
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <PortfolioGrid 
          items={items || []} 
          isOwner={true} 
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => {
            setEditingItem(null);
            setIsEditorOpen(true);
          }}
        />
      )}

      {isEditorOpen && (
        <PortfolioEditor 
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
