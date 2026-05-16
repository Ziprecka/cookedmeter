import { NextResponse } from "next/server";
import { createPublicResult } from "@/lib/public-results";
import { publicResultCreateSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = publicResultCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid share payload." },
      { status: 400 },
    );
  }

  try {
    const result = await createPublicResult({
      stored: parsed.data.stored,
      anonSessionId: parsed.data.anon_session_id,
    });
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get("origin") ||
      new URL(request.url).origin;

    return NextResponse.json({
      id: result.slug,
      url: `${origin}/r/${result.slug}`,
    });
  } catch (error) {
    console.error("Public result creation failed", error);
    return NextResponse.json(
      { error: "Could not make a short share link." },
      { status: 500 },
    );
  }
}
