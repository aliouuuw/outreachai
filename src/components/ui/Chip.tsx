import { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ className = "", active = false, children, ...props }: ChipProps) {
  return (
    <button
      className={`
        px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
        ${active 
          ? "bg-accent/[0.12] border-accent/40 text-[#a78bfa]" 
          : "bg-transparent border-border text-muted2 hover:border-accent/40 hover:text-text"
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
