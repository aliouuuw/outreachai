import { db } from "@/db";
import { subscriptions, usageQuotas } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import type { SubscriptionTier } from "@/db/schema";

type QuotaAction = "lead_search" | "leads_returned" | "ai_message";

const PLAN_LIMITS: Record<SubscriptionTier, Record<QuotaAction, number>> = {
  starter: { lead_search: 20, leads_returned: 200, ai_message: 25 },
  pro: { lead_search: 200, leads_returned: 10_000, ai_message: 10_000 },
  agency: { lead_search: 1_000, leads_returned: 100_000, ai_message: 100_000 },
};

const ACTION_TO_COLUMN = {
  lead_search: "leadSearchesUsed",
  leads_returned: "leadsReturnedUsed",
  ai_message: "aiMessagesUsed",
} as const satisfies Record<QuotaAction, keyof typeof usageQuotas.$inferSelect>;

export type QuotaStatus = {
  tier: SubscriptionTier;
  leadSearchesUsed: number;
  leadsReturnedUsed: number;
  aiMessagesUsed: number;
  limits: Record<QuotaAction, number>;
  periodStart: Date;
  periodEnd: Date;
};

async function getUserSubscription(userId: string) {
  return db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
}

async function getOrCreateQuota(
  userId: string,
  periodStart: Date,
  periodEnd: Date
) {
  const now = new Date();

  const existing = await db.query.usageQuotas.findFirst({
    where: and(
      eq(usageQuotas.userId, userId),
      lte(usageQuotas.periodStart, now),
      gte(usageQuotas.periodEnd, now)
    ),
  });

  if (existing) return existing;

  const [created] = await db
    .insert(usageQuotas)
    .values({
      id: crypto.randomUUID(),
      userId,
      periodStart,
      periodEnd,
      leadSearchesUsed: 0,
      leadsReturnedUsed: 0,
      aiMessagesUsed: 0,
    })
    .returning();

  return created;
}

export class QuotaExceededError extends Error {
  constructor(
    public readonly action: QuotaAction,
    public readonly used: number,
    public readonly limit: number,
    public readonly tier: SubscriptionTier
  ) {
    super(`Quota exceeded for '${action}': ${used}/${limit} on plan '${tier}'`);
    this.name = "QuotaExceededError";
  }
}

export async function assertWithinPlanLimits({
  userId,
  action,
  units,
}: {
  userId: string;
  action: QuotaAction;
  units: number;
}) {
  const subscription = await getUserSubscription(userId);

  const tier: SubscriptionTier = subscription?.tier ?? "starter";
  const isActive =
    !subscription ||
    subscription.status === "active" ||
    subscription.status === "trialing";

  if (!isActive) {
    throw new QuotaExceededError(action, 0, 0, tier);
  }

  const now = new Date();
  const periodStart = subscription?.currentPeriodStart ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = subscription?.currentPeriodEnd ?? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const quota = await getOrCreateQuota(userId, periodStart, periodEnd);

  const currentUsage = quota[ACTION_TO_COLUMN[action]];
  const limit = PLAN_LIMITS[tier][action];

  if (currentUsage + units > limit) {
    throw new QuotaExceededError(action, currentUsage, limit, tier);
  }
}

export async function incrementUsage({
  userId,
  action,
  units,
}: {
  userId: string;
  action: QuotaAction;
  units: number;
}) {
  const subscription = await getUserSubscription(userId);
  const now = new Date();
  const periodStart = subscription?.currentPeriodStart ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = subscription?.currentPeriodEnd ?? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const quota = await getOrCreateQuota(userId, periodStart, periodEnd);

  const column = ACTION_TO_COLUMN[action];
  const newValue = quota[column] + units;

  await db
    .update(usageQuotas)
    .set({
      [column]: newValue,
      updatedAt: new Date(),
    })
    .where(eq(usageQuotas.id, quota.id));
}

export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  const subscription = await getUserSubscription(userId);
  const tier: SubscriptionTier = subscription?.tier ?? "starter";

  const now = new Date();
  const periodStart = subscription?.currentPeriodStart ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = subscription?.currentPeriodEnd ?? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const quota = await getOrCreateQuota(userId, periodStart, periodEnd);

  return {
    tier,
    leadSearchesUsed: quota.leadSearchesUsed,
    leadsReturnedUsed: quota.leadsReturnedUsed,
    aiMessagesUsed: quota.aiMessagesUsed,
    limits: PLAN_LIMITS[tier],
    periodStart: quota.periodStart,
    periodEnd: quota.periodEnd,
  };
}
