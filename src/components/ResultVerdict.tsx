"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getScoreTone } from "@/lib/cooked-utils";
import type { StoredResult } from "@/lib/schemas";

const headlines = [
  "Verdict delivered.",
  "The oven has spoken.",
  "Cooked level confirmed.",
  "Diagnosis complete.",
] as const;

export function ResultVerdict({ stored, revealed }: { stored: StoredResult; revealed: boolean }) {
  const finalScore = stored.result.cooked_score;
  const [displayScore, setDisplayScore] = useState(finalScore === null ? null : 0);
  const headline = headlines[Math.abs(hash(stored.id)) % headlines.length];

  useEffect(() => {
    if (!revealed || finalScore === null) {
      return;
    }

    let frame = 0;
    const total = 34;
    const interval = window.setInterval(() => {
      frame += 1;
      const eased = 1 - Math.pow(1 - frame / total, 3);
      setDisplayScore(Math.round(finalScore * eased));
      if (frame >= total) window.clearInterval(interval);
    }, 18);

    return () => window.clearInterval(interval);
  }, [finalScore, revealed]);

  return (
    <section className="verdict-in mx-auto flex w-full max-w-4xl flex-col items-center text-center">
      <p className="text-sm font-black uppercase tracking-[0.32em] text-orange-100/52">
        {headline}
      </p>
      <div className="relative mt-8 grid size-64 place-items-center rounded-full border border-white/10 bg-black/44 shadow-[0_0_100px_rgba(255,91,26,.16)] sm:size-80">
        <div className="absolute inset-3 rounded-full border border-orange-300/18" />
        <div className="absolute inset-8 rounded-full bg-[conic-gradient(from_210deg,#2dd4bf,#c8ff00,#ffb000,#ff4d00,#ff1744)] opacity-80 blur-sm" />
        <div className="absolute inset-11 rounded-full bg-[#070505]" />
        <div className="relative">
          <div className={`bg-gradient-to-r ${getScoreTone(finalScore)} bg-clip-text text-7xl font-black leading-none text-transparent sm:text-8xl`}>
            {finalScore === null ? "SAFE" : `${displayScore}%`}
          </div>
          <div className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-white/34">
            Cooked score
          </div>
        </div>
      </div>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-lime-200/25 bg-lime-300 px-5 py-2 text-sm font-black text-black shadow-[0_0_34px_rgba(203,255,0,.18)]">
        <Flame className="size-4 fill-black/20" />
        {stored.result.cooked_level}
      </div>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-white/35">
        {stored.result.cooked_category} / {stored.result.seriousness_level}
      </p>

      <h1 className="mt-6 max-w-3xl text-3xl font-black leading-tight text-white sm:text-5xl">
        {stored.result.one_line_diagnosis}
      </h1>
      <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/52">
        {stored.result.share_card_summary}
      </p>
    </section>
  );
}

function hash(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}
