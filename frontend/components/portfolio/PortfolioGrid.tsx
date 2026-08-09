import React, { useState } from "react";
import { PortfolioCard } from "./PortfolioCard";
import { PortfolioDetailModal } from "./PortfolioDetailModal";

export function PortfolioGrid({ items, isOwner, onEdit, onDelete, onAdd }: any) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem = items?.find((i: any) => i.id === selectedItemId);

  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">No portfolio items yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-4">
          {isOwner 
            ? "Showcase your best work to stand out to businesses and get more collaborations."
            : "This creator hasn't uploaded any portfolio items yet."}
        </p>
        {isOwner && onAdd && (
          <button 
            onClick={onAdd}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 h-9 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Portfolio Item
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item: any, index: number) => (
          <div
            key={item.id}
            className="animate-fade-slide-up"
            style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
          >
            <PortfolioCard
              item={item}
              isOwner={isOwner}
              onClick={(item: any) => setSelectedItemId(item.id)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>

      <PortfolioDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItemId(null)}
      />
    </>
  );
}
