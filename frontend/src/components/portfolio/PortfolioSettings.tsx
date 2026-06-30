import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useMyPortfolio, useDeletePortfolioItem } from "../../features/portfolio";
import { PortfolioGrid } from "./PortfolioGrid";
import { PortfolioEditor } from "./PortfolioEditor";
import type { PortfolioItem } from "../../features/portfolio";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export function PortfolioSettings() {
  const { data: items, isLoading } = useMyPortfolio();
  const deleteMutation = useDeletePortfolioItem();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSettled: () => setDeleteId(null),
      });
    }
  };

  return (
    <div className="bg-white rounded-cards shadow-product-card-product-card p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-heading text-graphite mb-2">Portfolio</h3>
          <p className="text-sm text-fog">Showcase your past work, collaborations, and successful campaigns to brands.</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsEditorOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-signal-blue text-white h-10 px-4 rounded-button text-sm font-semibold hover:opacity-90 transition-colors shadow-product-card-sm"
        >
          <Plus size={16} /> Add Project
        </button>
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-signal-blue/20 border-t-signal-blue rounded-full animate-spin"></div>
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

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
