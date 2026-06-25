import Dialog from "./Dialog";
import Button from "./Button";

type ConfirmVariant = "primary" | "danger";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">{message}</p>
    </Dialog>
  );
}
