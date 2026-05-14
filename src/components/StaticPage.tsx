import Link from "next/link";
import { Flame } from "lucide-react";

export function StaticPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen ember-bg px-4 py-6 text-[#fff9ed] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-lg font-black">
            <span className="grid size-10 place-items-center rounded-2xl border border-orange-300/30 bg-orange-500/15">
              <Flame className="size-5 fill-orange-400/30" />
            </span>
            CookedMeter
          </Link>
          <Link
            href="/"
            className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-400"
          >
            Check if I&apos;m cooked
          </Link>
        </header>
        <section className="mt-16 rounded-[2rem] border border-white/12 bg-black/42 p-6 shadow-2xl shadow-black/25 sm:p-10">
          <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl">
            {title}
          </h1>
          <div className="mt-8 space-y-6 text-base leading-8 text-white/70">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
