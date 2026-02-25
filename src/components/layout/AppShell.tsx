/**
 * Purpose: Authenticated layout wrapper — renders sidebar navigation on desktop and
 *          a hamburger-triggered mobile nav on small screens, with a main content area.
 * Variants: none
 * Props: children (page content)
 * States: loading (session pending — skeleton sidebar), error (minimal shell + logout),
 *         success (full sidebar + content)
 * Usage: Wrap authenticated pages: <AppShell>{children}</AppShell>
 * Do not use when: rendering public/marketing pages or auth pages (login, signup, etc.)
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { labels } from "@/copy/labels";
import { ErrorState } from "@/components/ui/ErrorState";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

type SubscriptionTier = "starter" | "pro" | "agency";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isPending && !session && !error) {
      router.push('/login');
    }
  }, [isPending, session, error, router]);

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const user = session?.user ?? null;
  const tier: SubscriptionTier = "starter";

  if (isPending) {
    // Show loading state while checking session
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!session || error) {
    // Redirect to login if no session or there's an error
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex">
      {/* Desktop sidebar — hidden below tablet */}
      <div className="hidden md:flex md:w-[260px] md:flex-shrink-0">
        <div className="fixed inset-y-0 left-0 w-[260px]">
          <Sidebar
            user={user}
            tier={tier}
            isLoading={isPending}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Mobile nav overlay */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        user={user}
        tier={tier}
        isLoading={isPending}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar — visible below tablet */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-[var(--space-4)] py-[var(--space-3)] bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-neutral-400)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-neutral-200)] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            aria-label={labels.shell.openMenu}
          >
            <Menu size={24} />
          </button>
          <span className="text-[var(--text-base)] font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent">
            {labels.shell.appName}
          </span>
          {/* Spacer to balance the hamburger button */}
          <div className="w-10" aria-hidden="true" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-[var(--space-6)]">
          {children}
        </main>
      </div>
    </div>
  );
}
