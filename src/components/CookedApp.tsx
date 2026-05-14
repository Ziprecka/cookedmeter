"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { examples } from "@/lib/cooked-data";
import { buildStoredResult, encodeShareState } from "@/lib/cooked-utils";
import { CookedInput } from "./CookedInput";
import { LoadingReveal } from "./LoadingReveal";

export function CookedApp() {
  const router = useRouter();
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const example = new URLSearchParams(window.location.search).get("example");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (example) setSituation(example);
  }, []);

  const request = useMemo(() => ({ situation, source: "homepage" as const }), [situation]);

  async function checkCooked() {
    const payload = { ...request, situation: situation.trim() };
    setError("");

    if (payload.situation.length < 8) {
      setError("Give the oracle at least one real detail.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/check-cooked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "The oven jammed.");

      const stored = buildStoredResult(payload, data.result);
      localStorage.setItem("cookedmeter:last-result", JSON.stringify(stored));
      router.push(`/result?c=${encodeShareState(stored)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The oven jammed.");
      setLoading(false);
    }
  }

  function pickRandomExample() {
    const next = examples[Math.floor(Math.random() * examples.length)];
    setSituation(next);
    setError("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050404] text-[#fff9ed]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,91,26,.18),transparent_34rem),radial-gradient(circle_at_50%_82%,rgba(203,255,0,.08),transparent_22rem)]" />
      <div className="oracle-noise pointer-events-none absolute inset-0" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-black tracking-tight text-white/82">
          <span className="grid size-8 place-items-center rounded-full border border-orange-200/24 bg-orange-500/12">
            <Flame className="size-4 fill-orange-400/25 text-orange-100" />
          </span>
          CookedMeter
        </Link>
        <nav className="flex items-center gap-4 text-xs font-bold text-white/42">
          <Link className="transition hover:text-white" href="/examples">
            Examples
          </Link>
          <Link className="transition hover:text-white" href="/about">
            About
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col items-center justify-center px-4 pb-10 text-center sm:px-6">
        <h1 className="text-7xl font-black leading-[0.86] tracking-normal text-white sm:text-8xl lg:text-[9.5rem]">
          Am I cooked?
        </h1>
        <p className="mt-5 text-lg font-semibold text-white/58 sm:text-xl">
          Drop the situation. Get the verdict.
        </p>
        <button
          type="button"
          onClick={pickRandomExample}
          className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-orange-100/44 transition hover:text-orange-100"
        >
          Random example
        </button>

        <div className="mt-5 w-full">
          <CookedInput
            situation={situation}
            loading={loading}
            error={error}
            onSituationChange={(value) => {
              setSituation(value);
              setError("");
            }}
            onSubmit={checkCooked}
          />
        </div>

        <footer className="mt-12 flex flex-wrap justify-center gap-4 text-[0.7rem] font-semibold text-white/22 sm:mt-16">
          <Link className="transition hover:text-white" href="/contact">
            Contact
          </Link>
          <Link className="transition hover:text-white" href="/pricing">
            Pricing
          </Link>
          <Link className="transition hover:text-white" href="/privacy">
            Privacy
          </Link>
          <Link className="transition hover:text-white" href="/terms">
            Terms
          </Link>
        </footer>
      </section>

      <LoadingReveal active={loading} />
    </main>
  );
}
