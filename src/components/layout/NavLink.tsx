"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export function NavLink({ href, icon, children, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        transition-all duration-150
        ${
          isActive
            ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border-l-2 border-[var(--color-primary)]"
            : "text-[var(--color-neutral-300)] hover:text-[var(--color-neutral-100)] hover:bg-[var(--color-surface-raised)]"
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]
      `}
      aria-current={isActive ? "page" : undefined}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span style={{ fontSize: "var(--text-sm)", fontWeight: isActive ? 500 : 400 }}>
        {children}
      </span>
    </Link>
  );
}
