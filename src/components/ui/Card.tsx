/**
 * Purpose: Generic card container with surface background and border.
 * Variants: default (static), featured (primary accent border + gradient), interactive (hover lift)
 * Props: variant, className, children, all HTMLDivElement props
 * States: default, hover (interactive variant only)
 * Usage: <Card variant="interactive">content</Card>
 * Do not use when: you need a clickable card — wrap with a Link instead
 */
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "featured" | "interactive";
}

const VARIANT_STYLES: Record<NonNullable<CardProps["variant"]>, string> = {
  default:
    "bg-[var(--color-surface-raised)] border-[var(--color-border)]",
  featured:
    "bg-[var(--color-surface-raised)] border-[var(--color-primary)]/45 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary-hover)]/5",
  interactive:
    "bg-[var(--color-surface-raised)] border-[var(--color-border)] hover:border-[var(--color-primary)]/35 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all duration-150 ease cursor-default",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-[var(--radius-xl)] border p-[var(--space-6)] ${VARIANT_STYLES[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
