/**
 * Purpose: Shared layout wrapper for all authentication pages (login, signup, forgot-password, reset-password).
 * Variants: none
 * Props: title, subtitle, children, footer (optional)
 * States: N/A (static layout)
 * Usage: <AuthLayout title="Welcome back" subtitle="Sign in to continue">{form}</AuthLayout>
 * Do not use when: rendering authenticated app pages — use AppShell instead
 */
import Link from "next/link";
import { labels } from "@/copy/labels";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div
      className="relative min-h-screen bg-[var(--color-surface)] overflow-hidden flex items-center justify-center px-[var(--space-4)]"
      data-no-custom-cursor
    >
      {/* Ambient glow orbs — decorative, use primary token color via CSS */}
      <div className="auth-orb auth-orb--top-left" aria-hidden="true" />
      <div className="auth-orb auth-orb--bottom-right" aria-hidden="true" />
      <div className="auth-orb auth-orb--mid-right" aria-hidden="true" />

      {/* Grid background — decorative */}
      <div className="absolute inset-0 opacity-5 auth-grid" aria-hidden="true" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="mb-[var(--space-8)] text-center">
          <Link href="/" className="inline-block mb-[var(--space-6)]">
            <span className="text-[var(--text-h2)] font-bold tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent">
              {labels.shell.appName}
            </span>
          </Link>
          <h1 className="text-[var(--text-h1)] font-bold text-[var(--color-neutral-50)]">
            {title}
          </h1>
          <p className="text-[var(--text-base)] text-[var(--color-neutral-400)] mt-[var(--space-2)]">
            {subtitle}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--space-8)] shadow-[var(--shadow-lg)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-[var(--space-8)] text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
