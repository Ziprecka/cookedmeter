import type { Metadata } from "next";
import Link from "next/link";
import { Flame } from "lucide-react";
import { ResultExperience } from "@/components/ResultExperience";
import { getPublicResult } from "@/lib/public-results";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicResult(slug);

  if (!result) {
    return {
      title: "CookedMeter Verdict",
      description: "A CookedMeter verdict has either vanished or never existed.",
    };
  }

  const score =
    result.stored.result.cooked_score === null
      ? "Safe Mode"
      : `${result.stored.result.cooked_score}% cooked`;
  const title = `I was ${score} - ${result.stored.result.cooked_level}`;
  const description = result.stored.result.meme_verdict;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function PublicResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicResult(slug, true);

  if (!result) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050404] px-4 text-center text-white">
        <div>
          <Flame className="mx-auto size-12 text-orange-200" />
          <h1 className="mt-5 text-4xl font-black">Verdict missing.</h1>
          <p className="mt-3 text-white/54">
            This share link is toast. Very on brand, but still annoying.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-4 font-black text-white"
          >
            Make a new verdict
          </Link>
        </div>
      </main>
    );
  }

  return (
    <ResultExperience
      initialStored={result.stored}
      publicUrl={`https://cookedmeter.com/r/${result.slug}`}
    />
  );
}
