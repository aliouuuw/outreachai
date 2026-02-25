/**
 * Purpose: Displays the user's current subscription tier as a colored pill badge.
 * Variants: starter (default), pro, agency
 * Props: tier — subscription tier string; className — optional override
 * States: loading (skeleton pill), success (tier label), error (hidden)
 * Usage: <PlanBadge tier="pro" />
 * Do not use when: tier data is not relevant to the context
 */

import { labels } from "@/copy/labels";

type SubscriptionTier = "starter" | "pro" | "agency";

interface PlanBadgeProps {
  tier?: SubscriptionTier | null;
  isLoading?: boolean;
  className?: string;
}

const TIER_STYLES: Record<SubscriptionTier, string> = {
  starter:
    "bg-[var(--color-neutral-800)] text-[var(--color-neutral-300)] border-[var(--color-border)]",
  pro: "bg-[var(--color-primary-subtle)] text-[var(--color-primary-hover)] border-[var(--color-primary)]/25",
  agency:
    "bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning)]/25",
};

const TIER_LABELS: Record<SubscriptionTier, string> = {
  starter: labels.shell.planBadge.starter,
  pro: labels.shell.planBadge.pro,
  agency: labels.shell.planBadge.agency,
};

export function PlanBadge({ tier, isLoading, className = "" }: PlanBadgeProps) {
  if (isLoading) {
    return (
      <span
        className={`inline-block h-[20px] w-[48px] rounded-full bg-[var(--color-neutral-800)] animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (!tier) return null;

  const resolvedTier: SubscriptionTier =
    tier in TIER_STYLES ? tier : "starter";

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-[var(--text-caption)] font-semibold uppercase tracking-wider
        rounded-full border
        transition-colors duration-150
        ${TIER_STYLES[resolvedTier]}
        ${className}
      `}
    >
      {TIER_LABELS[resolvedTier]}
    </span>
  );
}
