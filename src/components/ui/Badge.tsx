import { ReactNode } from "react";

interface BadgeProps {
  variant?: "default" | "nosite" | "noreviews" | "success" | "warning";
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const variants = {
    default: "bg-bg3 border-border text-muted2",
    nosite: "bg-red/10 border-red/25 text-[#f87171]",
    noreviews: "bg-amber/10 border-amber/25 text-[#fbbf24]",
    success: "bg-green/10 border-green/25 text-[#34d399]",
    warning: "bg-amber/10 border-amber/25 text-[#fbbf24]",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider
        px-2 py-0.5 rounded-full border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
