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

export const stripeProductIds: Record<StripeProductType, string | undefined> = {
  refill: process.env.STRIPE_PRODUCT_REFILL,
  extra_crispy: process.env.STRIPE_PRODUCT_EXTRA_CRISPY,
  unlimited: process.env.STRIPE_PRODUCT_UNLIMITED,
};

export const stripeProductCopy: Record<
  StripeProductType,
  { name: string; amount: number }
> = {
  refill: { name: "Cooked Refill", amount: 299 },
  extra_crispy: { name: "Extra Crispy Pack", amount: 499 },
  unlimited: { name: "Unlimited Cooked", amount: 499 },
};

export function getStripeMode(productType: StripeProductType) {
  return productType === "unlimited" ? "subscription" : "payment";
}
