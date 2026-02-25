import { ReactNode, useCallback, useEffect, useRef } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

type Variant = "primary" | "danger";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: Variant;
  confirmLoading?: boolean;
  footerExtra?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
  variant = "primary",
  confirmLoading = false,
  footerExtra,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  const focusCancel = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      focusCancel();
    }
  }, [isOpen, focusCancel]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      subtitle={description}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            ref={cancelRef}
            onClick={onCancel}
            variant="secondary"
            size="md"
            disabled={confirmLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            variant={variant === "danger" ? "outline" : "primary"}
            className={
              variant === "danger"
                ? "text-[var(--color-error)] border-[var(--color-error)] hover:border-[var(--color-error)]"
                : ""
            }
            size="md"
            disabled={confirmLoading}
          >
            {confirmLoading ? "En cours..." : confirmLabel}
          </Button>
          {footerExtra}
        </div>
      }
    >
      <div className="text-sm text-muted2 leading-relaxed">
        {description}
      </div>
    </Modal>
  );
}
