import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PortfolioCard } from "./PortfolioCard";
import type { PortfolioItem } from "../../features/portfolio";

interface PortfolioGridProps {
  items: PortfolioItem[];
  isOwner?: boolean;
  onEdit?: (item: PortfolioItem) => void;
  onDelete?: (id: string) => void;
}

export function PortfolioGrid({ items, isOwner, onEdit, onDelete }: PortfolioGridProps) {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">No portfolio items yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          {isOwner 
            ? "Showcase your best work to stand out to businesses and get more collaborations."
            : "This creator hasn't uploaded any portfolio items yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <PortfolioCard
                item={item}
                isOwner={isOwner}
                onClick={setSelectedItem}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PortfolioDetailDialog could be rendered here conditionally based on selectedItem */}
    </>
  );
}
