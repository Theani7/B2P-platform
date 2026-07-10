"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export function LogoutConfirmDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setConfirming(true);
    logout();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-cards bg-white p-6 shadow-elevated">
        <h2 className="text-heading font-semibold text-midnight-ink">Confirm logout</h2>
        <p className="mt-2 text-body text-slate-custom">
          Are you sure you want to log out?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="rounded-buttons border border-steel/40 px-4 py-2 text-body text-graphite hover:bg-sky-wash"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            className="rounded-buttons bg-coral-alert px-4 py-2 text-body font-medium text-white hover:opacity-90"
          >
            {confirming ? "Logging out…" : "Log out"}
          </button>
        </div>
      </div>
    </div>
  );
}
