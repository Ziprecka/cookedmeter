"use client";

import { useEffect, useRef } from "react";
import { adsenseConfig } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  slotId,
  label = "Advertisement",
}: {
  slotId?: string;
  label?: string;
}) {
  const pushed = useRef(false);
  const isDevelopment = process.env.NODE_ENV === "development";
  const canRender = adsenseConfig.enabled && adsenseConfig.clientId && slotId;

  useEffect(() => {
    if (!canRender || pushed.current) return;
    pushed.current = true;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ad blockers and script timing should never break the product.
    }
  }, [canRender]);

  if (!canRender) {
    if (!isDevelopment) return null;
    return (
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-dashed border-white/10 bg-white/[.025] p-5 text-center">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-white/24">
          Ad slot preview
        </p>
      </div>
    );
  }

  return (
    <aside className="mx-auto w-full max-w-2xl pt-4" aria-label={label}>
      <p className="mb-2 text-center text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white/22">
        {label}
      </p>
      <div className="min-h-28 overflow-hidden rounded-2xl border border-white/8 bg-black/18 p-2">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adsenseConfig.clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
