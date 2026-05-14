import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getStripeMode,
  stripe,
  stripePriceIds,
  type StripeProductType,
} from "@/lib/stripe";

const checkoutSchema = z.object({
  productType: z.enum(["refill", "extra_crispy", "unlimited"]),
  anonSessionId: z.string().trim().min(8).max(120),
  returnTo: z.string().url().optional(),
});

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout request." },
      { status: 400 },
    );
  }

  const { productType, anonSessionId, returnTo } = parsed.data;
  const price = stripePriceIds[productType as StripeProductType];

  if (!price) {
    return NextResponse.json(
      { error: "This pack is not configured in Stripe yet." },
      { status: 503 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get("origin") ||
    new URL(request.url).origin;
  const successUrl = new URL("/success", origin);
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  if (returnTo) successUrl.searchParams.set("return_to", returnTo);

  const cancelUrl = new URL("/cancel", origin);
  if (returnTo) cancelUrl.searchParams.set("return_to", returnTo);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: getStripeMode(productType),
      line_items: [{ price, quantity: 1 }],
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      allow_promotion_codes: true,
      metadata: {
        anon_session_id: anonSessionId,
        product_type: productType,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session failed", error);
    return NextResponse.json(
      {
        error:
          "Checkout is not connected to the right live Stripe prices yet.",
      },
      { status: 502 },
    );
  }
}
