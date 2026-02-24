import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "featured" | "interactive";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-bg2 border-border",
      featured: "bg-bg2 border-accent/45 bg-gradient-to-br from-accent/10 to-accent2/5",
      interactive: "bg-bg2 border-border hover:border-accent/35 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-default",
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl border p-6 ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
