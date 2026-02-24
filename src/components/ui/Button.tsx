import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-gradient-to-r from-accent to-accent2 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
      secondary: "bg-transparent border border-border text-muted2 hover:border-accent/50 hover:text-text hover:bg-accent/5",
      ghost: "bg-transparent text-muted hover:text-muted2",
      outline: "bg-transparent border border-border text-muted2 hover:border-accent/50 hover:text-text",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
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
