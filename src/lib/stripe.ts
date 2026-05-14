import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
    })
  : null;

export type StripeProductType = "refill" | "extra_crispy" | "unlimited";

export const stripePriceIds: Record<StripeProductType, string | undefined> = {
  refill: process.env.STRIPE_PRICE_REFILL,
  extra_crispy: process.env.STRIPE_PRICE_EXTRA_CRISPY,
  unlimited: process.env.STRIPE_PRICE_UNLIMITED,
};

export function getStripeMode(productType: StripeProductType) {
  return productType === "unlimited" ? "subscription" : "payment";
}
