import type { Metadata } from "next";
import { ResultExperience } from "@/components/ResultExperience";
import { decodeShareStateServer } from "@/lib/cooked-utils";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const stored = params.c ? decodeShareStateServer(params.c) : null;

  if (!stored) {
    return {
      title: "CookedMeter Verdict",
      description: "See a CookedMeter score, meme verdict, and recovery plan.",
    };
  }

  const score =
    stored.result.cooked_score === null
      ? "Safe Mode"
      : `${stored.result.cooked_score}% cooked`;
  const title = `I was ${score} — ${stored.result.cooked_level}`;
  const description = stored.result.one_line_diagnosis;

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

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const params = await searchParams;
  return <ResultExperience shared={params.c} />;
}
