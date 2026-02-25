"use client";

import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";
import { labels } from "@/copy/labels";
import { SubscriptionTier } from "@/db/schema/subscriptions";
import { useState, useEffect } from "react";

interface SidebarProps {
  tier?: SubscriptionTier;
  isLoading?: boolean;
}

export function Sidebar({ tier = "starter", isLoading }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const navItems = [
    { href: "/dashboard", label: labels.nav.dashboard, icon: "📊" },
    { href: "/leads", label: labels.nav.leadFinder, icon: "🔍" },
    { href: "/saved-leads", label: labels.nav.savedLeads, icon: "💾" },
    { href: "/settings", label: labels.nav.settings, icon: "⚙️" },
    { href: "/billing", label: labels.nav.billing, icon: "💳" },
  ];

  const sidebarContent = (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--color-surface-raised)" }}
    >
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1
          style={{
            fontSize: "var(--text-h3)",
            fontWeight: 700,
            color: "var(--color-neutral-100)",
          }}
        >
          OutreachAI
        </h1>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--color-surface-overlay)] transition-colors"
          style={{ color: "var(--color-neutral-300)" }}
          aria-label={labels.nav.closeMenu}
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 rounded-lg animate-pulse"
                style={{ backgroundColor: "var(--color-neutral-800)" }}
              />
            ))}
          </>
        ) : (
          navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={<span>{item.icon}</span>}
              onClick={() => setIsMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))
        )}
      </nav>

      <UserMenu tier={tier} />
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-3 rounded-lg shadow-lg"
        style={{
          backgroundColor: "var(--color-surface-raised)",
          color: "var(--color-neutral-100)",
          boxShadow: "var(--shadow-md)",
        }}
        aria-label={labels.nav.menu}
      >
        ☰
      </button>

      <aside
        className="hidden md:flex md:flex-col md:w-64 border-r"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
            style={{ transition: "opacity 150ms ease-in" }}
          />
          <aside
            className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            style={{
              backgroundColor: "var(--color-surface-raised)",
              boxShadow: "var(--shadow-xl)",
              animation: "slideInFromLeft 200ms ease-out",
            }}
          >
            {sidebarContent}
          </aside>
        </>
      )}

      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
