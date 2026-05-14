import type { CookedResult } from "@/lib/schemas";

export function ResultDetails({ result }: { result: CookedResult }) {
  return (
    <div className="mx-auto mt-6 grid w-full max-w-2xl gap-3">
      <BulletCard
        title="Cooked evidence"
        items={result.why_you_are_cooked.slice(0, 3)}
        tone="orange"
      />
      <BulletCard
        title="Survival odds"
        items={result.why_you_might_not_be_cooked.slice(0, 3)}
        tone="lime"
      />
      <div className="rounded-[1.35rem] border border-cyan-200/14 bg-cyan-200/[.055] p-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/74">
          Recovery plan
        </h2>
        <ol className="mt-3 space-y-2.5">
          {result.recovery_plan.slice(0, 4).map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-white/76">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-cyan-200 text-[0.7rem] font-black text-black">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-[1.5rem] border border-orange-300/32 bg-[radial-gradient(circle_at_15%_0%,rgba(255,91,26,.24),transparent_16rem),rgba(255,91,26,.12)] p-4 shadow-[0_0_44px_rgba(255,91,26,.13)]">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-orange-100/78">
          Meme verdict
        </h2>
        <p className="mt-3 text-2xl font-black leading-8 text-white">
          {result.meme_verdict}
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-white/58">
          {result.final_line}
        </p>
      </div>
    </div>
  );
}

function BulletCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "orange" | "lime";
}) {
  const toneClass =
    tone === "orange"
      ? "border-orange-300/14 bg-orange-500/[.055] text-orange-100/74"
      : "border-lime-200/14 bg-lime-300/[.045] text-lime-100/74";

  return (
    <div className={`rounded-[1.35rem] border p-4 ${toneClass}`}>
      <h2 className="text-xs font-black uppercase tracking-[0.2em]">{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {items.length ? (
          items.map((item) => (
            <li key={item} className="text-sm leading-6 text-white/76">
              {item}
            </li>
          ))
        ) : (
          <li className="text-sm leading-6 text-white/44">
            CookedMeter is keeping this one careful.
          </li>
        )}
      </ul>
    </div>
  );
}
