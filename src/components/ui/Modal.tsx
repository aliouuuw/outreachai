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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-xl max-h-[88vh] overflow-y-auto bg-bg2 border border-border rounded-2xl animate-modal-in"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
          <div>
            <h3 className="text-base font-bold tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-muted2 mt-0.5 font-light">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg3 border border-border text-muted2 hover:text-text hover:border-accent transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 p-5 border-t border-border">{footer}</div>}
      </div>
    </div>
  );
}
