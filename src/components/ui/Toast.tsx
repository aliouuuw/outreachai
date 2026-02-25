import { ReactNode, useEffect, useState } from "react";

const DEFAULT_TOAST_DURATION_MS = 4000; // Long enough for a short message to be read without overstaying

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastAction = {
  label: string;
  onClick: () => void;
};

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
  onClose?: () => void;
  className?: string;
  icon?: ReactNode;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success)]/40",
  error: "bg-[var(--color-error-subtle)] text-[var(--color-error)] border-[var(--color-error)]/40",
  warning: "bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning)]/40",
  info: "bg-[var(--color-info-subtle)] text-[var(--color-info)] border-[var(--color-info)]/40",
};

export function Toast({
  message,
  variant = "info",
  duration = DEFAULT_TOAST_DURATION_MS,
  action,
  onClose,
  className = "",
  icon,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md ${variantStyles[variant]} ${className}`}
    >
      {icon && <span aria-hidden className="text-lg">{icon}</span>}
      <span className="text-sm font-medium leading-relaxed flex-1">{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-semibold underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          {action.label}
        </button>
      )}
      {onClose && (
        <button
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="text-sm text-current opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          aria-label="Fermer la notification"
        >
          ×
        </button>
      )}
    </div>
  );
}
