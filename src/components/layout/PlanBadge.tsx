import { SubscriptionTier } from "@/db/schema/subscriptions";
import { labels } from "@/copy/labels";

interface PlanBadgeProps {
  tier: SubscriptionTier;
  isLoading?: boolean;
}

export function PlanBadge({ tier, isLoading }: PlanBadgeProps) {
  if (isLoading) {
    return (
      <div
        className="h-6 w-16 rounded-full animate-pulse"
        style={{ backgroundColor: "var(--color-neutral-800)" }}
        aria-label={labels.common.loading}
      />
    );
  }

  const tierColors = {
    starter: {
      bg: "var(--color-neutral-800)",
      text: "var(--color-neutral-300)",
    },
    pro: {
      bg: "var(--color-primary-subtle)",
      text: "var(--color-primary)",
    },
    agency: {
      bg: "var(--color-warning-subtle)",
      text: "var(--color-warning)",
    },
  };

  const colors = tierColors[tier];
  const tierLabel = labels.plan[tier];

  return (
    <span
      className="inline-flex items-center justify-center px-3 py-1"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontSize: "var(--text-caption)",
        fontWeight: 600,
        borderRadius: "var(--radius-full)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {tierLabel}
    </span>
  );
}
