import { Flame } from "lucide-react";
import { excerpt, getScoreTone } from "@/lib/cooked-utils";
import type { CookedResult } from "@/lib/schemas";

export function ShareCard({
  situation,
  result,
  watermark = true,
}: {
  situation: string;
  result: CookedResult;
  watermark?: boolean;
}) {
  return (
    <div className="relative aspect-[9/16] w-full min-w-[260px] overflow-hidden rounded-[2rem] bg-[#080606] p-5 text-white shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(255,91,26,.42),transparent_34%),radial-gradient(circle_at_90%_55%,rgba(203,255,0,.18),transparent_25%),linear-gradient(180deg,#130c08,#070606_62%,#030303)]" />
      <div className="absolute -right-14 -top-14 size-44 rounded-full bg-orange-500/25 blur-3xl" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <div className="text-sm font-black uppercase tracking-[0.22em] text-orange-100/78">
            AM I COOKED?
          </div>
          <div className="grid size-11 place-items-center rounded-2xl bg-orange-500/20">
            <Flame className="size-6 fill-orange-400/30 text-orange-100" />
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/12 bg-black/34 p-4">
          <p className="text-sm font-semibold leading-6 text-white/70">
            {excerpt(situation, 118)}
          </p>
        </div>

        <div className="mt-7">
          <div className={`bg-gradient-to-r ${getScoreTone(result.cooked_score)} bg-clip-text text-7xl font-black leading-none text-transparent`}>
            {result.cooked_score === null ? "SAFE" : `${result.cooked_score}%`}
          </div>
          <div className="mt-3 inline-flex rounded-2xl border border-lime-200/30 bg-lime-300 px-4 py-2 text-sm font-black text-black">
            {result.cooked_level}
          </div>
        </div>

        <p className="mt-7 text-2xl font-black leading-8">
          {result.one_line_diagnosis}
        </p>

        <div className="mt-auto rounded-3xl border border-orange-300/20 bg-orange-500/12 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-100/64">
            Meme verdict
          </p>
          <p className="mt-2 text-xl font-black leading-7">{result.meme_verdict}</p>
        </div>

        {watermark ? (
          <div className="mt-5 text-center text-xs font-black uppercase tracking-[0.26em] text-white/38">
            cookedmeter.com
          </div>
        ) : null}
      </div>
    </div>
  );
}
