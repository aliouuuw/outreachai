"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { labels } from "@/copy/labels";
import { PlanBadge } from "./PlanBadge";
import { SubscriptionTier } from "@/db/schema/subscriptions";
import { Button } from "@/components/ui";
import { useState } from "react";

interface UserMenuProps {
  tier?: SubscriptionTier;
}

export function UserMenu({ tier = "starter" }: UserMenuProps) {
  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  if (isPending) {
    return (
      <div className="flex flex-col gap-3 p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--color-neutral-800)" }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-4 w-24 rounded animate-pulse"
              style={{ backgroundColor: "var(--color-neutral-800)" }}
            />
            <div
              className="h-3 w-32 rounded animate-pulse"
              style={{ backgroundColor: "var(--color-neutral-800)" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col gap-3 p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--color-neutral-800)", color: "var(--color-neutral-400)" }}
          >
            ?
          </div>
          <div className="flex-1">
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-neutral-400)" }}>
              Session error
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
          {labels.auth.logout}
        </Button>
      </div>
    );
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex flex-col gap-3 p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: "var(--color-primary-subtle)",
            color: "var(--color-primary)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          {session.user.name && (
            <p
              className="truncate"
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 500,
                color: "var(--color-neutral-100)",
              }}
            >
              {session.user.name}
            </p>
          )}
          <p
            className="truncate"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-neutral-400)",
            }}
          >
            {session.user.email}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <PlanBadge tier={tier} />
        <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
          {labels.auth.logout}
        </Button>
      </div>
    </div>
  );
}
