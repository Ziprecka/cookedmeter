import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const password = request.headers.get("x-admin-password");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Nope." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role is not configured." },
      { status: 503 },
    );
  }

  const [sessions, purchases] = await Promise.all([
    supabase
      .from("usage_sessions")
      .select(
        "anon_session_id,total_generations,free_generations_used,paid_credits_remaining,has_unlimited,unlimited_until,no_watermark,created_at,updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase
      .from("purchases")
      .select(
        "stripe_session_id,anon_session_id,stripe_customer_id,product_type,credits_added,amount_paid,status,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (sessions.error) throw sessions.error;
  if (purchases.error) throw purchases.error;

  return NextResponse.json({
    sessions: sessions.data ?? [],
    purchases: purchases.data ?? [],
  });
}
