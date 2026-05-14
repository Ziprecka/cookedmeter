import { Flame } from "lucide-react";
import { getScoreTone } from "@/lib/cooked-utils";

export function ScoreMeter({ score }: { score: number | null }) {
  const pct = score ?? 0;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/42">
            Cooked score
          </p>
          <div className={`mt-1 bg-gradient-to-r ${getScoreTone(score)} bg-clip-text text-7xl font-black leading-none text-transparent sm:text-8xl`}>
            {score === null ? "SAFE" : `${score}%`}
          </div>
        </div>
        <div className="grid size-16 place-items-center rounded-full border border-orange-300/25 bg-orange-500/12">
          <Flame className="size-8 fill-orange-400/30 text-orange-200" />
        </div>
      </div>
      <div className="mt-5 h-5 overflow-hidden rounded-full border border-white/10 bg-black/60 p-1">
        <div
          className="score-sheen h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: score === null ? "100%" : `${Math.max(3, pct)}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[0.68rem] font-black uppercase tracking-[0.14em] text-white/35">
        <span>Raw</span>
        <span>Crispy</span>
        <span>Ashes</span>
      </div>
    </div>
  );
}
