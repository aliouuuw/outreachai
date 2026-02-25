/**
 * Purpose: Persistent vertical navigation sidebar for the authenticated app shell.
 * Variants: none (single variant, responsive via parent)
 * Props: user, tier, isLoading, onLogout
 * States: loading (skeleton nav + user), error (minimal with logout), success (full nav)
 * Usage: <Sidebar user={session.user} tier="pro" isLoading={isPending} onLogout={handleLogout} />
 * Do not use when: on public/marketing pages — this is for authenticated routes only
 */
"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  Settings,
  CreditCard,
} from "lucide-react";
import { labels } from "@/copy/labels";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";
import { PlanBadge } from "./PlanBadge";

type SubscriptionTier = "starter" | "pro" | "agency";

interface SidebarProps {
  user?: { name?: string | null; email?: string | null } | null;
  tier?: SubscriptionTier | null;
  isLoading?: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: <LayoutDashboard size={20} />, label: labels.nav.dashboard },
  { href: "/leads", icon: <Search size={20} />, label: labels.nav.leadFinder },
  { href: "/saved-leads", icon: <Bookmark size={20} />, label: labels.nav.savedLeads },
  { href: "/settings", icon: <Settings size={20} />, label: labels.nav.settings },
  { href: "/billing", icon: <CreditCard size={20} />, label: labels.nav.billing },
] as const;

const SKELETON_NAV_ITEMS_COUNT = 5;

export function Sidebar({
  user,
  tier,
  isLoading,
  onLogout,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col h-full bg-[var(--color-surface-raised)] border-r border-[var(--color-border)]"
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-6)]">
        <span className="text-[var(--text-h4)] font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent">
          {labels.shell.appName}
        </span>
        <PlanBadge tier={tier} isLoading={isLoading} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-[var(--space-3)] py-[var(--space-2)]" aria-label="Main navigation">
        <ul className="flex flex-col gap-[var(--space-1)]" role="list">
          {isLoading
            ? Array.from({ length: SKELETON_NAV_ITEMS_COUNT }).map((_, i) => (
                <li key={i}>
                  <div className="flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[var(--space-2)]">
                    <div className="w-5 h-5 rounded bg-[var(--color-neutral-800)] animate-pulse" />
                    <div
                      className="h-3.5 rounded bg-[var(--color-neutral-800)] animate-pulse"
                      style={{ width: `${60 + i * 12}px` }}
                    />
                  </div>
                </li>
              ))
            : NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={pathname.startsWith(item.href)}
                    onClick={onNavigate}
                  />
                </li>
              ))}
        </ul>
      </nav>

      {/* User menu at bottom */}
      <div className="border-t border-[var(--color-border)] px-[var(--space-3)] py-[var(--space-3)]">
        <UserMenu user={user} isLoading={isLoading} onLogout={onLogout} />
      </div>
    </aside>
  );
}
