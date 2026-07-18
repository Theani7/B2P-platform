import { Portal } from "./Portal";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-midnight-ink/60 backdrop-blur-md p-4">
        <div className="bg-white border border-slate-custom/10 rounded-cards-lg p-8 shadow-xl max-w-sm w-full">
          <h3 className="text-xl font-bold text-graphite mb-3">{title}</h3>
          <p className="text-sm font-medium text-ash leading-relaxed mb-8">
            {message}
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button variant={isDanger ? "danger" : "primary"} onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
