/**
 * Purpose: Displays the authenticated user's identity (name/email) with a logout action.
 * Variants: none
 * Props: user (name, email), onLogout, isLoading
 * States: loading (skeleton), success (user info + logout), error (fallback label + logout)
 * Usage: <UserMenu user={{ name: "Ali", email: "ali@test.com" }} onLogout={handleLogout} />
 * Do not use when: user is not authenticated — component assumes auth context
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronUp, User } from "lucide-react";
import { labels } from "@/copy/labels";

interface UserMenuProps {
  user?: { name?: string | null; email?: string | null } | null;
  isLoading?: boolean;
  onLogout: () => void;
}

export function UserMenu({ user, isLoading, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[var(--space-2)]">
        <div className="w-8 h-8 rounded-full bg-[var(--color-neutral-800)] animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="w-20 h-3 rounded bg-[var(--color-neutral-800)] animate-pulse" />
          <div className="w-28 h-2.5 rounded bg-[var(--color-neutral-800)] animate-pulse" />
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Account";
  const displayEmail = user?.email || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          w-full flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[var(--space-2)]
          rounded-[var(--radius-md)] text-left
          transition-colors duration-150
          hover:bg-[var(--color-surface-overlay)]
          outline-none
          focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]
        `}
        aria-label={labels.shell.userMenuLabel}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center text-[var(--text-caption)] font-semibold text-white">
          {initials}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[var(--text-sm)] font-medium text-[var(--color-neutral-100)] truncate">
            {displayName}
          </span>
          {displayEmail && (
            <span className="block text-[var(--text-caption)] text-[var(--color-neutral-500)] truncate">
              {displayEmail}
            </span>
          )}
        </span>
        <ChevronUp
          size={16}
          className={`
            flex-shrink-0 text-[var(--color-neutral-500)]
            transition-transform duration-150
            ${isOpen ? "rotate-0" : "rotate-180"}
          `}
        />
      </button>

      {isOpen && (
        <div
          className="
            absolute bottom-full left-0 right-0 mb-[var(--space-2)]
            bg-[var(--color-surface-raised)] border border-[var(--color-border)]
            rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]
            py-[var(--space-1)] overflow-hidden
            animate-modal-in
          "
          role="menu"
        >
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="
              w-full flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-2)]
              text-[var(--text-sm)] text-[var(--color-neutral-400)]
              hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-error)]
              transition-colors duration-150
              outline-none
              focus-visible:bg-[var(--color-surface-overlay)] focus-visible:text-[var(--color-error)]
            "
            role="menuitem"
          >
            <LogOut size={16} />
            <span>{labels.auth.logout}</span>
          </button>
        </div>
      )}
    </div>
  );
}
