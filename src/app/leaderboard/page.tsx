import Link from "next/link";
import { Flame, Trophy } from "lucide-react";
import { getLeaderboard } from "@/lib/public-results";
import { excerpt, getScoreTone } from "@/lib/cooked-utils";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const results = await getLeaderboard(30);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050404] px-4 py-6 text-[#fff9ed] sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,91,26,.18),transparent_28rem),radial-gradient(circle_at_50%_78%,rgba(203,255,0,.08),transparent_22rem)]" />
      <div className="oracle-noise pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-black text-white/78">
            <span className="grid size-8 place-items-center rounded-full border border-orange-200/24 bg-orange-500/12">
              <Flame className="size-4 fill-orange-400/25 text-orange-100" />
            </span>
            CookedMeter
          </Link>
          <Link
            href="/"
            className="rounded-full bg-orange-500 px-4 py-3 text-sm font-black text-white"
          >
            Get judged
          </Link>
        </header>

        <section className="mx-auto mt-14 max-w-3xl text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full border border-orange-300/24 bg-orange-500/12">
            <Trophy className="size-7 text-orange-100" />
          </div>
          <h1 className="mt-5 text-5xl font-black leading-none text-white sm:text-7xl">
            Wall of Cooked.
          </h1>
          <p className="mt-4 text-lg font-semibold text-white/55">
            Public verdicts people chose to unleash on the internet.
          </p>
        </section>

        <section className="mt-10 grid gap-3">
          {results.length ? (
            results.map((result, index) => {
              const score = result.stored.result.cooked_score;
              return (
                <Link
                  key={result.slug}
                  href={`/r/${result.slug}`}
                  className="group grid gap-4 rounded-[1.25rem] border border-white/10 bg-white/[.045] p-4 transition hover:border-orange-300/34 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
                >
                  <div className="flex items-center gap-3 sm:block">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-white/34">
                      #{index + 1}
                    </div>
                    <div className={`bg-gradient-to-r ${getScoreTone(score)} bg-clip-text text-4xl font-black text-transparent sm:mt-1`}>
                      {score === null ? "SAFE" : `${score}%`}
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-lime-300 px-3 py-1 text-xs font-black text-black">
                        {result.stored.result.cooked_level}
                      </span>
                      <span className="text-xs font-bold text-white/38">
                        {result.stored.result.cooked_category}
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-black leading-6 text-white group-hover:text-orange-100">
                      {result.stored.result.meme_verdict}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-white/48">
                      {excerpt(result.stored.situation, 120)}
                    </p>
                  </div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-white/28 sm:text-right">
                    {result.viewsCount} views
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[.04] p-6 text-center">
              <p className="text-xl font-black text-white">No public verdicts yet.</p>
              <p className="mt-2 text-white/52">
                The leaderboard is waiting for someone brave enough to share the damage.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
