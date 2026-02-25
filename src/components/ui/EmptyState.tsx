import { ReactNode } from "react";
import { Button } from "./Button";

type Action = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost" | "outline";
};

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: Action;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center text-center gap-[var(--space-4)] p-[var(--space-8)] border border-[var(--color-border)] rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] ${className}`}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="text-[var(--color-primary)]" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-[var(--space-2)] max-w-md">
        <h3 className="text-[var(--text-h4)] font-semibold text-[var(--color-neutral-50)] tracking-tight">{title}</h3>
        <p className="text-[var(--text-sm)] text-[var(--color-neutral-400)] leading-relaxed">{description}</p>
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "primary"}
          size="md"
        >
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
