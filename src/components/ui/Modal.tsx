import { useEffect, useCallback, ReactNode } from "react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, subtitle, children, footer }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-[var(--space-6)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-xl max-h-[88vh] overflow-y-auto bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] animate-modal-in"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-[var(--space-4)] p-[var(--space-6)] border-b border-[var(--color-border)]">
          <div>
            <h3 className="text-[var(--text-base)] font-bold text-[var(--color-neutral-50)] tracking-tight">{title}</h3>
            {subtitle && <p className="text-[var(--text-caption)] text-[var(--color-neutral-400)] mt-[var(--space-1)]">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-50)] hover:border-[var(--color-neutral-600)] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-[var(--space-6)]">{children}</div>
        {footer && <div className="flex justify-end gap-[var(--space-3)] p-[var(--space-6)] border-t border-[var(--color-border)]">{footer}</div>}
      </div>
    </div>
  );
}
