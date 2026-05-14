"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { loadingMessages } from "@/lib/cooked-data";

export function LoadingReveal({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % loadingMessages.length);
    }, 720);
    return () => window.clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#050303]/96 px-6 text-center backdrop-blur-md">
      <div className="oracle-noise absolute inset-0" />
      <div className="relative">
        <div className="mx-auto grid size-28 place-items-center rounded-full border border-orange-300/24 bg-orange-500/12 shadow-[0_0_80px_rgba(255,91,26,.28)]">
          <Flame className="size-12 fill-orange-400/25 text-orange-100 heat-pulse" />
        </div>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-orange-100/54">
          CookedMeter
        </p>
        <p className="mt-4 text-4xl font-black text-white sm:text-6xl">
          {loadingMessages[index]}
        </p>
      </div>
    </div>
  );
}
