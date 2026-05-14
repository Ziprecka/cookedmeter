"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { homepagePlaceholders } from "@/lib/cooked-data";
import { ExampleChips } from "./ExampleChips";

export function CookedInput({
  situation,
  loading,
  error,
  onSituationChange,
  onSubmit,
}: {
  situation: string;
  loading: boolean;
  error: string;
  onSituationChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % homepagePlaceholders.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <textarea
        value={situation}
        onChange={(event) => onSituationChange(event.target.value)}
        placeholder={homepagePlaceholders[placeholderIndex]}
        className="min-h-48 w-full resize-none rounded-[2rem] border border-white/10 bg-black/54 px-6 py-6 text-xl leading-8 text-white shadow-[0_0_90px_rgba(255,91,26,.16)] outline-none ring-orange-400/40 transition placeholder:text-white/28 focus:border-orange-300/45 focus:ring-4 sm:min-h-52 sm:text-2xl"
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="heat-pulse mt-5 inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-orange-500 px-6 text-base font-black text-white shadow-[0_0_42px_rgba(255,91,26,.34)] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70 sm:text-lg"
      >
        <Flame className="size-5 fill-white/25" />
        Check my cooked level
      </button>

      {error ? (
        <p className="mt-4 text-center text-sm font-bold text-red-300">{error}</p>
      ) : null}

      <div className="mt-5">
        <ExampleChips onPick={onSituationChange} />
      </div>
    </div>
  );
}
