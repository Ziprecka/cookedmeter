"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  applyPurchase,
  readClientUsage,
  writeClientUsage,
  type PaywallStage,
} from "@/lib/usage";

export default function SuccessPage() {
  const [message, setMessage] = useState("Waking the oven back up...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const returnTo = params.get("return_to") || "/";

    async function verify() {
      if (!sessionId) {
        setMessage("Payment landed, but the receipt is missing.");
        return;
      }

      try {
        const response = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not verify payment.");

        const usage = readClientUsage();
        const next = applyPurchase(
          usage,
          data.productType as PaywallStage,
          sessionId,
        );
        writeClientUsage(next);
        setMessage("Unlocked. The oven is back online.");

        window.setTimeout(() => {
          window.location.href = returnTo;
        }, 900);
      } catch {
        setMessage("Payment succeeded, but the unlock is still syncing. Try refreshing in a minute.");
      }
    }

    void verify();
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[#050404] px-4 text-center text-white">
      <div className="max-w-md">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200/70">
          CookedMeter
        </p>
        <h1 className="mt-4 text-4xl font-black">Payment complete.</h1>
        <p className="mt-4 text-white/62">{message}</p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-orange-500 px-6 font-black text-white"
        >
          Check another
        </Link>
      </div>
    </main>
  );
}
