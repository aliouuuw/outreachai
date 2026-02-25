import { ReactNode } from "react";
import { Button } from "./Button";

type Action = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost" | "outline";
};

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry: () => void;
  errorCode?: string;
  icon?: ReactNode;
  secondaryAction?: Action;
  className?: string;
}

export function ErrorState({
  title,
  description,
  onRetry,
  errorCode,
  icon,
  secondaryAction,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center text-center gap-4 p-8 border border-border rounded-xl bg-bg2 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {icon && (
        <div className="text-3xl text-[var(--color-error)]" aria-hidden>
          {icon}
        </div>
      )}
      <div className="space-y-2 max-w-md">
        <h3 className="text-h4 font-semibold text-text tracking-tight">{title}</h3>
        <p className="text-sm text-muted2 leading-relaxed">{description}</p>
        {errorCode && <p className="text-xs text-muted">Code: {errorCode}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onRetry} variant="primary" size="md">
          Réessayer
        </Button>
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant={secondaryAction.variant || "secondary"}
            size="md"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
