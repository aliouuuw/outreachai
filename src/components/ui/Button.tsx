import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-[var(--radius-md)] transition-all duration-150 ease disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-[0.98] shadow-[var(--shadow-md)]",
      secondary:
        "bg-transparent border border-[var(--color-border)] text-[var(--color-neutral-200)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-neutral-50)] hover:bg-[var(--color-primary-subtle)]",
      ghost:
        "bg-transparent text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-200)] hover:bg-[var(--color-surface-overlay)]",
      outline:
        "bg-transparent border border-[var(--color-border)] text-[var(--color-neutral-200)] hover:border-[var(--color-neutral-400)] hover:text-[var(--color-neutral-50)]",
      danger:
        "bg-[var(--color-error)] text-white hover:opacity-90 active:scale-[0.98]",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "px-[var(--space-3)] py-[var(--space-1)] text-[var(--text-caption)] gap-[var(--space-1)]",
      md: "px-[var(--space-4)] py-[var(--space-2)] text-[var(--text-sm)] gap-[var(--space-2)]",
      lg: "px-[var(--space-6)] py-[var(--space-3)] text-[var(--text-base)] gap-[var(--space-2)]",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
