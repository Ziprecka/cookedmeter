"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  Clipboard,
  Eye,
  Flame,
  Link2,
  Share2,
  X,
} from "lucide-react";
import { toPng } from "html-to-image";
import { decodeShareState, encodeShareState, excerpt } from "@/lib/cooked-utils";
import { adsenseConfig } from "@/lib/adsense";
import type { StoredResult } from "@/lib/schemas";
import { getUsageStatus, readClientUsage } from "@/lib/usage";
import { AdSlot } from "./AdSlot";
import { LoadingReveal } from "./LoadingReveal";
import { ResultDetails } from "./ResultDetails";
import { ResultVerdict } from "./ResultVerdict";
import { ShareCard } from "./ShareCard";

export function ResultExperience({
  shared,
  initialStored,
  publicUrl,
}: {
  shared?: string;
  initialStored?: StoredResult | null;
  publicUrl?: string;
}) {
  const [stored, setStored] = useState<StoredResult | null>(null);
  const [revealing, setRevealing] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [usageLabel, setUsageLabel] = useState("");
  const [watermark, setWatermark] = useState(true);
  const [shortUrl, setShortUrl] = useState(publicUrl ?? "");
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let next: StoredResult | null = initialStored ?? null;
    if (shared) next = decodeShareState(shared);

    if (!next) {
      const latest = localStorage.getItem("cookedmeter:last-result");
      if (latest) {
        try {
          next = JSON.parse(latest) as StoredResult;
        } catch {
          localStorage.removeItem("cookedmeter:last-result");
        }
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStored(next);
    const usage = readClientUsage();
    const status = getUsageStatus(usage);
    setUsageLabel(status.label);
    setWatermark(!status.noWatermark);
    const timeout = window.setTimeout(() => setRevealing(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [shared, initialStored]);

  useEffect(() => {
    document.body.style.overflow = shareOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [shareOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShareOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!stored && !revealing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050404] px-4 text-center text-white">
        <div>
          <Flame className="mx-auto size-12 text-orange-200" />
          <h1 className="mt-5 text-4xl font-black">No verdict found.</h1>
          <p className="mt-3 text-white/54">The oracle needs a fresh situation.</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-4 font-black text-white"
          >
            Try another
          </Link>
        </div>
      </main>
    );
  }

  async function copyResult() {
    if (!stored) return;
    const score =
      stored.result.cooked_score === null
        ? "Safe Mode"
        : `${stored.result.cooked_score}% cooked`;
    const copied = await writeClipboard(
      [
        `CookedMeter: ${score} (${stored.result.cooked_level})`,
        stored.result.one_line_diagnosis,
        stored.result.meme_verdict,
        stored.result.final_line,
      ].join("\n"),
    );
    setNotice(copied ? "Copied." : "Copy permission was blocked.");
  }

  async function copyPublicLink() {
    if (!stored) return;
    const url = await ensurePublicLink();
    const copied = await writeClipboard(url);
    setNotice(copied ? "Short link copied." : "Copy permission was blocked.");
  }

  async function downloadCard() {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#080606",
    });
    const link = document.createElement("a");
    link.download = "cookedmeter-verdict.png";
    link.href = dataUrl;
    link.click();
    setNotice("Trophy downloaded.");
  }

  async function createCardFile() {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#080606",
    });
    return dataUrlToFile(dataUrl);
  }

  async function ensurePublicLink() {
    if (!stored) return window.location.origin;
    if (shortUrl) return shortUrl;

    try {
      const usage = readClientUsage();
      const response = await fetch("/api/public-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stored,
          anon_session_id: usage.anonSessionId,
        }),
      });
      const data = (await response.json()) as { url?: string };
      if (response.ok && data.url) {
        setShortUrl(data.url);
        return data.url;
      }
    } catch {
      // Fall back to encoded state if Supabase is unavailable.
    }

    return `${window.location.origin}/result?c=${encodeShareState(stored)}`;
  }

  async function shareVerdict() {
    if (!stored) return;
    setSharing(true);
    setNotice("");
    try {
      const url = await ensurePublicLink();
      const score =
        stored.result.cooked_score === null
          ? "Safe Mode"
          : `${stored.result.cooked_score}% cooked`;
      const shareText = `CookedMeter says I'm ${score}. ${stored.result.meme_verdict}`;
      const cardFile = await createCardFile();

      if (
        cardFile &&
        navigator.canShare?.({ files: [cardFile] }) &&
        navigator.share
      ) {
        await navigator.share({
          title: "CookedMeter verdict",
          text: shareText,
          url,
          files: [cardFile],
        });
        setNotice("Shared the trophy card.");
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "CookedMeter verdict",
          text: shareText,
          url,
        });
        return;
      }

      const copied = await writeClipboard(`${shareText}\n${url}`);
      setNotice(
        copied
          ? "Short verdict copied. Download the card if the app wants a picture."
          : "Copy permission was blocked.",
      );
    } catch {
      setNotice("Share got blocked. Preview or download the card instead.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050404] pb-10 text-[#fff9ed]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,91,26,.20),transparent_28rem),radial-gradient(circle_at_50%_85%,rgba(203,255,0,.10),transparent_24rem)]" />
      <div className="oracle-noise pointer-events-none absolute inset-0" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-black text-white/78">
          <span className="grid size-8 place-items-center rounded-full border border-orange-200/24 bg-orange-500/12">
            <Flame className="size-4 fill-orange-400/25 text-orange-100" />
          </span>
          CookedMeter
        </Link>
        <Link className="text-xs font-black uppercase tracking-[0.2em] text-white/42 hover:text-white" href="/">
          Try another
        </Link>
      </header>

      {stored ? (
        <div className="relative z-10 mx-auto px-4 pb-8 pt-4 sm:px-6">
          <ResultVerdict stored={stored} revealed={!revealing} />
          {usageLabel ? (
            <p className="mt-3 text-center text-xs font-black uppercase tracking-[0.18em] text-white/30">
              {usageLabel}
            </p>
          ) : null}

          <section className="mx-auto mt-6 max-w-2xl rounded-[1.4rem] border border-white/10 bg-black/34 p-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/36">
              The situation
            </p>
            <p className="mt-3 text-lg font-bold leading-7 text-white/76">
              {excerpt(stored.situation, 180)}
            </p>
          </section>

          <ResultDetails result={stored.result} />
          {notice ? (
            <p className="mt-5 text-center text-sm font-black text-lime-200">{notice}</p>
          ) : null}

          <div className="mx-auto mt-7 flex max-w-2xl flex-wrap justify-center gap-2">
            <ActionButton onClick={shareVerdict} icon={<Share2 className="size-4" />} label={sharing ? "Making card..." : "Share card"} primary />
            <ActionButton onClick={downloadCard} icon={<ArrowDownToLine className="size-4" />} label="Download card" />
            <ActionButton onClick={() => setShareOpen(true)} icon={<Eye className="size-4" />} label="Preview share card" />
            <ActionButton onClick={copyResult} icon={<Clipboard className="size-4" />} label="Copy result" />
            <ActionButton onClick={copyPublicLink} icon={<Link2 className="size-4" />} label="Copy link" />
          </div>

          <div className="mx-auto mt-4 max-w-2xl">
            <Link
              href="/"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-white px-6 text-base font-black text-black transition hover:bg-lime-200"
            >
              Try another
            </Link>
          </div>

          <div className="mx-auto mt-10 max-w-2xl border-t border-white/8 pt-7">
            <AdSlot slotId={adsenseConfig.resultSlotId} />
          </div>

          <div className="fixed -left-[9999px] top-0 w-[420px]" aria-hidden>
            <div ref={cardRef}>
              <ShareCard situation={stored.situation} result={stored.result} watermark={watermark} />
            </div>
          </div>

          {shareOpen ? (
            <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/86 p-4 backdrop-blur-md">
              <button
                type="button"
                aria-label="Close share card preview"
                onClick={() => setShareOpen(false)}
                className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/10 bg-white/[.06] text-white"
              >
                <X className="size-5" />
              </button>
              <div className="w-full max-w-[360px]">
                <ShareCard situation={stored.situation} result={stored.result} watermark={watermark} />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <LoadingReveal active={revealing} />
    </main>
  );
}

async function writeClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

async function dataUrlToFile(dataUrl: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], "cookedmeter-verdict.png", { type: "image/png" });
}

function ActionButton({
  icon,
  label,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition ${
        primary
          ? "bg-orange-500 text-white hover:bg-orange-400"
          : "border border-white/10 bg-white/[.06] text-white/78 hover:border-white/28 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
