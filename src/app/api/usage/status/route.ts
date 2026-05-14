import { NextResponse } from "next/server";
import { readUsageCookie } from "@/lib/usage";
import {
  getAnonSessionFromRequest,
  getServerUsageStatus,
} from "@/lib/usage-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const anonSessionId = getAnonSessionFromRequest(
    request,
    url.searchParams.get("anon_session_id") ?? undefined,
  );

  if (!anonSessionId) {
    return NextResponse.json(
      { error: "Missing anonymous session." },
      { status: 400 },
    );
  }

  const cookieUsage = readUsageCookie(request.headers.get("cookie"));
  const usage = await getServerUsageStatus(anonSessionId, cookieUsage);
  return NextResponse.json({ usage });
}
