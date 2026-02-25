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
      className={`flex flex-col items-center text-center gap-4 p-8 border border-border rounded-xl bg-bg2 ${className}`}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="text-3xl text-accent" aria-hidden>
          {icon}
        </div>
      )}
      <div className="space-y-2 max-w-md">
        <h3 className="text-h4 font-semibold text-text tracking-tight">{title}</h3>
        <p className="text-sm text-muted2 leading-relaxed">{description}</p>
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
