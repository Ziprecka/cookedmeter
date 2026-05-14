import { NextResponse } from "next/server";
import { grantPurchaseToSession } from "@/lib/usage-server";
import { stripe, type StripeProductType } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const anonSessionId = session.metadata?.anon_session_id;
    const productType = session.metadata?.product_type as StripeProductType | undefined;

    if (anonSessionId && productType) {
      try {
        await grantPurchaseToSession({
          anonSessionId,
          stripeSessionId: session.id,
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : session.customer?.id,
          productType,
          amountPaid: session.amount_total,
        });
      } catch (error) {
        console.error("Stripe webhook purchase grant failed", error);
        return NextResponse.json({ error: "Grant failed." }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
