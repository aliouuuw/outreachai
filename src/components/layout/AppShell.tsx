"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { SubscriptionTier } from "@/db/schema/subscriptions";

interface AppShellProps {
  children: ReactNode;
  tier?: SubscriptionTier;
  isLoading?: boolean;
}

export function AppShell({ children, tier = "starter", isLoading = false }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
      <Sidebar tier={tier} isLoading={isLoading} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
