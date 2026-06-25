import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { useLogout } from "../../features/auth/api";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hasUnsavedChanges?: boolean;
}

export function LogoutConfirmDialog({ isOpen, onClose, hasUnsavedChanges = false }: LogoutConfirmDialogProps) {
  const logout = useLogout();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus cancel button on open
      setTimeout(() => cancelRef.current?.focus(), 10);
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={!logout.isPending ? onClose : undefined}
          />
          
          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 ring-8 ring-red-50/50">
                  <LogOut size={28} className="text-red-500" strokeWidth={2.5} />
                </div>
                
                <h2 id="logout-title" className="text-[22px] font-bold text-gray-900 mb-2">
                  Sign out?
                </h2>
                
                <p className="text-[15px] text-gray-500 mb-8 leading-relaxed px-4">
                  {hasUnsavedChanges 
                    ? "You have unsaved changes. Logging out now may discard them."
                    : "Are you sure you want to sign out of your account? You can sign in again at any time."}
                </p>

                <div className="flex items-center gap-3 w-full">
                  <button
                    ref={cancelRef}
                    onClick={onClose}
                    disabled={logout.isPending}
                    className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-[14px] font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="flex-1 h-12 rounded-xl bg-red-600 text-[14px] font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-80"
                  >
                    {logout.isPending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing Out...
                      </>
                    ) : (
                      "Sign Out"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
