import Link from "next/link";
import { examples, futureModes } from "@/lib/cooked-data";
import { StaticPage } from "@/components/StaticPage";
import { AdSlot } from "@/components/AdSlot";
import { adsenseConfig } from "@/lib/adsense";

export default function ExamplesPage() {
  return (
    <StaticPage title="Examples">
      <p>
        These are the kinds of situations CookedMeter understands best: messy,
        specific, funny, and recoverable.
      </p>
      <div className="grid gap-3">
        {examples.map((example, index) => (
          <div key={example}>
            <Link
              href={`/?example=${encodeURIComponent(example)}`}
              className="block rounded-2xl border border-white/10 bg-white/[.04] p-4 font-bold text-white transition hover:border-orange-300/40"
            >
              {example}
            </Link>
            {index === 5 ? (
              <div className="my-6 border-y border-white/8 py-5">
                <AdSlot slotId={adsenseConfig.gallerySlotId} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-orange-300/18 bg-orange-500/[.07] p-5">
        <h2 className="text-2xl font-black text-white">Submit your situation</h2>
        <p className="mt-2 text-white/62">
          Got a better disaster? Drop it into the machine and let the oven judge.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400"
        >
          Check my cooked level
        </Link>
      </div>
      <div>
        <h2 className="text-2xl font-black text-white">Future modes</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {futureModes.map((mode) => (
            <span
              key={mode}
              className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-sm font-bold text-white/68"
            >
              {mode}
            </span>
          ))}
        </div>
      </div>
    </StaticPage>
  );
}
