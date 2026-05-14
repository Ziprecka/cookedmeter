import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe, type StripeProductType } from "@/lib/stripe";
import { grantPurchaseToSession } from "@/lib/usage-server";

const verifySchema = z.object({
  sessionId: z.string().min(8),
});

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid Stripe session." },
      { status: 400 },
    );
  }

  const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
  const anonSessionId = session.metadata?.anon_session_id;
  const productType = session.metadata?.product_type as StripeProductType | undefined;
  const paid =
    session.payment_status === "paid" ||
    (session.mode === "subscription" && session.status === "complete");

  if (!paid || !anonSessionId || !productType) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await grantPurchaseToSession({
    anonSessionId,
    stripeSessionId: session.id,
    stripeCustomerId:
      typeof session.customer === "string" ? session.customer : session.customer?.id,
    productType,
    amountPaid: session.amount_total,
  });

  return NextResponse.json({ ok: true, productType, anonSessionId });
}
