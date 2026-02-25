import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { SubscriptionTier, SubscriptionStatus } from "@/db/schema";
import type Stripe from "stripe";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

function mapStripePlanToTier(priceId: string): SubscriptionTier {
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_AGENCY) return "agency";
  return "starter";
}

function mapStripeStatusToLocal(status: Stripe.Subscription["status"]): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    case "trialing":
      return "trialing";
    default:
      return "canceled";
  }
}

async function upsertSubscription({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
  tier,
  status,
  currentPeriodStart,
  currentPeriodEnd,
}: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        tier,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      tier,
      status,
      currentPeriodStart,
      currentPeriodEnd,
    });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode !== "subscription") break;

        const userId = checkoutSession.metadata?.userId ?? checkoutSession.client_reference_id;
        if (!userId) {
          console.error("checkout.session.completed: missing userId in metadata");
          break;
        }

        const subscriptionId = checkoutSession.subscription as string;
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const firstItem = stripeSubscription.items.data[0];
        const priceId = firstItem?.price.id ?? "";

        await upsertSubscription({
          userId,
          stripeCustomerId: checkoutSession.customer as string,
          stripeSubscriptionId: subscriptionId,
          tier: mapStripePlanToTier(priceId),
          status: mapStripeStatusToLocal(stripeSubscription.status),
          currentPeriodStart: new Date((firstItem?.current_period_start ?? 0) * 1000),
          currentPeriodEnd: new Date((firstItem?.current_period_end ?? 0) * 1000),
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) {
          console.error("customer.subscription.updated: missing userId in metadata");
          break;
        }

        const firstItem = sub.items.data[0];
        const priceId = firstItem?.price.id ?? "";

        await upsertSubscription({
          userId,
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          tier: mapStripePlanToTier(priceId),
          status: mapStripeStatusToLocal(sub.status),
          currentPeriodStart: new Date((firstItem?.current_period_start ?? 0) * 1000),
          currentPeriodEnd: new Date((firstItem?.current_period_end ?? 0) * 1000),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const existing = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubscriptionId, sub.id),
        });

        if (existing) {
          await db
            .update(subscriptions)
            .set({
              status: "canceled",
              tier: "starter",
              canceledAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // In Stripe v20, subscription reference is on the parent field
        const subscriptionId = invoice.parent?.subscription_details?.subscription as string | null | undefined;

        if (subscriptionId) {
          await db
            .update(subscriptions)
            .set({ status: "past_due", updatedAt: new Date() })
            .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: { bodyParser: false },
};
