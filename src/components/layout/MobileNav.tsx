/**
 * Purpose: Mobile navigation overlay triggered by a hamburger button, slides in from left.
 * Variants: none
 * Props: isOpen, onClose, plus all Sidebar props (user, tier, isLoading, onLogout)
 * States: closed (hamburger icon), open (full-screen overlay with nav), transition (200ms slide)
 * Usage: <MobileNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} ... />
 * Do not use when: viewport is >= tablet breakpoint — hidden via CSS
 */
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { labels } from "@/copy/labels";
import { Sidebar } from "./Sidebar";

type SubscriptionTier = "starter" | "pro" | "agency";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { name?: string | null; email?: string | null } | null;
  tier?: SubscriptionTier | null;
  isLoading?: boolean;
  onLogout: () => void;
}

export function MobileNav({
  isOpen,
  onClose,
  user,
  tier,
  isLoading,
  onLogout,
}: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40
          bg-black/60 backdrop-blur-sm
          transition-opacity duration-200
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50
          w-[280px] max-w-[85vw]
          transition-transform duration-200 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-[var(--space-4)] right-[var(--space-4)] z-10
            w-8 h-8 flex items-center justify-center
            rounded-[var(--radius-md)]
            text-[var(--color-neutral-400)]
            hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-neutral-200)]
            transition-colors duration-150
            outline-none
            focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]
          "
          aria-label={labels.shell.closeMenu}
        >
          <X size={20} />
        </button>

        <Sidebar
          user={user}
          tier={tier}
          isLoading={isLoading}
          onLogout={onLogout}
          onNavigate={onClose}
        />
      </div>
    </>
  );
}
