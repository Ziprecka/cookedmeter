import Link from "next/link";

export default function CancelPage({
  searchParams,
}: {
  searchParams?: Promise<{ return_to?: string }>;
}) {
  void searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#050404] px-4 text-center text-white">
      <div className="max-w-md">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200/70">
          CookedMeter
        </p>
        <h1 className="mt-4 text-4xl font-black">Checkout cancelled.</h1>
        <p className="mt-4 text-white/62">
          No charge. The oven is still judging from a distance.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-black text-black"
        >
          Back to CookedMeter
        </Link>
      </div>
    </main>
  );
}
