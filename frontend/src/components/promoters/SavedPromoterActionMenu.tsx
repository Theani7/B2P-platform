import { useState, useRef, useEffect } from "react";
import { MoreVertical, ArrowLeftRight, Copy, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { notifySuccess } from "../../hooks/useToast";

function useClickOutside(ref: any, handler: () => void) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

export function ActionMenu({ promoter, onRemove, onCompare }: any) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setOpen(false));

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-50 overflow-hidden py-1"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onCompare(promoter.id); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeftRight size={16} className="text-gray-400" /> Compare
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); notifySuccess("Link copied to clipboard"); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Copy size={16} className="text-gray-400" /> Copy Link
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setOpen(false); onRemove(promoter.id); }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> Remove from list
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
