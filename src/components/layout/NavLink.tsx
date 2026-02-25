/**
 * Purpose: A single navigation link with active-route highlighting and icon support.
 * Variants: default, active (based on current pathname)
 * Props: href, icon, label, isActive
 * States: default, hover, active, focused, disabled
 * Usage: <NavLink href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" isActive={true} />
 * Do not use when: linking to external URLs — use a standard anchor instead
 */
"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

export function NavLink({ href, icon, label, isActive, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-md)] text-[var(--text-sm)] font-normal transition-all duration-150 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] ${
        isActive
          ? "bg-[var(--color-primary-subtle)] text-[var(--color-neutral-50)] font-medium"
          : "text-[var(--color-neutral-400)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-neutral-200)]"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={`flex-shrink-0 w-5 h-5 transition-colors duration-150 ${
          isActive
            ? "text-[var(--color-primary)]"
            : "text-[var(--color-neutral-500)] group-hover:text-[var(--color-neutral-300)]"
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
      {isActive && (
        <span
          className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
