import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-middleware";
import { createCheckoutSession, STRIPE_PRICE_IDS, StripePlan } from "@/lib/stripe";

const PAID_PLANS = ["pro", "agency"] as const satisfies Exclude<StripePlan, "starter">[];

export async function POST(request: NextRequest) {
  const { session, userId } = await requireSession(request);
  if (!session || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const plan = body.plan as Exclude<StripePlan, "starter"> | undefined;
  if (!plan || !PAID_PLANS.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan. Must be 'pro' or 'agency'" }, { status: 400 });
  }

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID for plan '${plan}' is not configured` },
      { status: 500 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  try {
    const checkoutSession = await createCheckoutSession({
      priceId,
      userId,
      customerEmail: session.user.email,
      successUrl: `${baseUrl}/dashboard?upgraded=true`,
      cancelUrl: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
