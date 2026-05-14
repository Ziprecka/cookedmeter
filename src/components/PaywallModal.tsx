"use client";

import { Flame, Sparkles, X } from "lucide-react";
import type { PaywallStage, UsageStatus } from "@/lib/usage";

const offers = {
  refill: {
    title: "You're officially out of free checks.",
    body: "You got 5 free verdicts. Add 10 more for less than a gas station snack.",
    primary: "Get 10 more - $2.99",
    secondary: "Unlock unlimited - $4.99/mo",
    primaryProduct: "refill",
  },
  extra_crispy: {
    title: "You're not just cooked. You're a regular.",
    body: "Add 25 more checks and remove the watermark from share cards.",
    primary: "Get Extra Crispy Pack - $4.99",
    secondary: "Go unlimited - $4.99/mo",
    primaryProduct: "extra_crispy",
  },
  unlimited: {
    title: "Unlimited cooked checks.",
    body: "For people making enough questionable decisions to justify a subscription.",
    primary: "Unlock unlimited - $4.99/mo",
    secondary: "Maybe later",
    primaryProduct: "unlimited",
  },
} as const;

export function PaywallModal({
  open,
  stage,
  status,
  loadingProduct,
  onCheckout,
  onClose,
}: {
  open: boolean;
  stage: PaywallStage;
  status: UsageStatus;
  loadingProduct: string;
  onCheckout: (productType: "refill" | "extra_crispy" | "unlimited") => void;
  onClose: () => void;
}) {
  if (!open) return null;
  const offer = offers[stage];
  const canClose = status.canGenerate;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/82 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-[2rem] border border-orange-300/22 bg-[#0c0806] p-5 text-white shadow-[0_0_80px_rgba(255,91,26,.22)]">
        <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_30%_0%,rgba(255,91,26,.22),transparent_18rem)]" />
        <div className="relative">
          <button
            type="button"
            aria-label="Close paywall"
            onClick={onClose}
            className="absolute right-0 top-0 grid size-9 place-items-center rounded-full border border-white/10 bg-white/[.04] text-white/52 transition hover:text-white"
          >
            <X className="size-4" />
          </button>
          <div className="grid size-12 place-items-center rounded-full bg-orange-500/18 text-orange-100">
            <Flame className="size-6 fill-orange-400/25" />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-lime-200/68">
            {status.generationCount} verdicts generated
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight">{offer.title}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/62">
            {offer.body}
          </p>

          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={() => onCheckout(offer.primaryProduct)}
              disabled={Boolean(loadingProduct)}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-black text-white transition hover:bg-orange-400 disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              {loadingProduct === offer.primaryProduct ? "Opening Stripe..." : offer.primary}
            </button>
            <button
              type="button"
              onClick={() =>
                stage === "unlimited" && canClose
                  ? onClose()
                  : onCheckout("unlimited")
              }
              disabled={Boolean(loadingProduct)}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/[.05] px-5 text-sm font-black text-white/72 transition hover:border-white/24 hover:text-white disabled:opacity-60"
            >
              {loadingProduct === "unlimited" ? "Opening Stripe..." : offer.secondary}
            </button>
            {canClose ? (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-white/34 transition hover:text-white/70"
              >
                Maybe later
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
