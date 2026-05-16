import { randomBytes } from "crypto";
import { excerpt } from "./cooked-utils";
import { getSupabaseAdmin } from "./supabase-admin";
import type { CookedResult, StoredResult } from "./schemas";

export type PublicResultRow = {
  share_slug: string;
  situation_excerpt: string;
  category: string;
  cooked_score: number | null;
  cooked_level: string;
  one_line_diagnosis: string;
  meme_verdict: string;
  share_card_summary: string;
  generated_json: CookedResult;
  views_count: number;
  created_at: string;
};

export type PublicResult = {
  slug: string;
  stored: StoredResult;
  viewsCount: number;
};

export async function createPublicResult({
  stored,
  anonSessionId,
}: {
  stored: StoredResult;
  anonSessionId?: string;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase is not configured.");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const shareSlug = createShareSlug();
    const { data, error } = await supabase
      .from("public_results")
      .insert({
        share_slug: shareSlug,
        situation_excerpt: excerpt(stored.situation, 220),
        category: stored.result.cooked_category,
        cooked_score: stored.result.cooked_score,
        cooked_level: stored.result.cooked_level,
        one_line_diagnosis: stored.result.one_line_diagnosis,
        meme_verdict: stored.result.meme_verdict,
        share_card_summary: stored.result.share_card_summary,
        generated_json: stored.result,
        anon_session_id: anonSessionId ?? null,
      })
      .select(
        "share_slug,situation_excerpt,category,cooked_score,cooked_level,one_line_diagnosis,meme_verdict,share_card_summary,generated_json,views_count,created_at",
      )
      .single<PublicResultRow>();

    if (!error && data) return rowToPublicResult(data);
    if (error?.code !== "23505") throw error;
  }

  throw new Error("Could not create share link.");
}

export async function getPublicResult(slug: string, incrementViews = false) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("public_results")
    .select(
      "share_slug,situation_excerpt,category,cooked_score,cooked_level,one_line_diagnosis,meme_verdict,share_card_summary,generated_json,views_count,created_at",
    )
    .eq("share_slug", slug)
    .eq("is_public", true)
    .maybeSingle<PublicResultRow>();

  if (error) throw error;
  if (!data) return null;

  if (incrementViews) {
    await supabase
      .from("public_results")
      .update({ views_count: data.views_count + 1 })
      .eq("share_slug", slug);
    data.views_count += 1;
  }

  return rowToPublicResult(data);
}

export async function getLeaderboard(limit = 30) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("public_results")
    .select(
      "share_slug,situation_excerpt,category,cooked_score,cooked_level,one_line_diagnosis,meme_verdict,share_card_summary,generated_json,views_count,created_at",
    )
    .eq("is_public", true)
    .not("cooked_score", "is", null)
    .order("cooked_score", { ascending: false })
    .order("views_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<PublicResultRow[]>();

  if (error) throw error;
  return (data ?? []).map(rowToPublicResult);
}

function rowToPublicResult(row: PublicResultRow): PublicResult {
  return {
    slug: row.share_slug,
    viewsCount: row.views_count,
    stored: {
      id: row.share_slug,
      situation: row.situation_excerpt,
      result: row.generated_json,
      createdAt: row.created_at,
    },
  };
}

function createShareSlug() {
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
  const bytes = randomBytes(8);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
