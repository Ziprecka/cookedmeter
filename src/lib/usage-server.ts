import { getSupabaseAdmin } from "./supabase-admin";
import {
  FREE_GENERATION_LIMIT,
  getPaywallStage,
  hasUnlimitedAccess,
  type PaywallStage,
  type UsageState,
} from "./usage";

export type ServerUsageStatus = {
  canGenerate: boolean;
  anonSessionId: string;
  generationCount: number;
  freeRemaining: number;
  paidCredits: number;
  hasUnlimited: boolean;
  noWatermark: boolean;
  paywallStage: PaywallStage;
  source: "supabase" | "cookie";
};

type UsageSessionRow = {
  anon_session_id: string;
  total_generations: number;
  free_generations_used: number;
  paid_credits_remaining: number;
  has_unlimited: boolean;
  unlimited_until: string | null;
  no_watermark: boolean;
};

export function getAnonSessionFromRequest(request: Request, fallback?: string) {
  const bodyFallback = fallback?.trim();
  if (bodyFallback) return bodyFallback;

  const cookieHeader = request.headers.get("cookie");
  const cookies = Object.fromEntries(
    (cookieHeader ?? "").split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  );

  return cookies.cookedmeter_anon_session_id || "";
}

export async function getServerUsageStatus(
  anonSessionId: string,
  cookieUsage: UsageState | null,
): Promise<ServerUsageStatus> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const usage = cookieUsage;
    const generationCount = usage?.generationCount ?? 0;
    const paidCredits = usage?.paidCredits ?? 0;
    const hasUnlimited = usage ? hasUnlimitedAccess(usage) : false;
    const freeRemaining = Math.max(0, FREE_GENERATION_LIMIT - generationCount);
    return {
      canGenerate: hasUnlimited || paidCredits > 0 || freeRemaining > 0,
      anonSessionId,
      generationCount,
      freeRemaining,
      paidCredits,
      hasUnlimited,
      noWatermark: Boolean(usage?.noWatermark || hasUnlimited),
      paywallStage: getPaywallStage(generationCount),
      source: "cookie",
    };
  }

  const { data, error } = await supabase
    .from("usage_sessions")
    .select(
      "anon_session_id,total_generations,free_generations_used,paid_credits_remaining,has_unlimited,unlimited_until,no_watermark",
    )
    .eq("anon_session_id", anonSessionId)
    .maybeSingle<UsageSessionRow>();

  if (error) throw error;

  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from("usage_sessions")
      .insert({ anon_session_id: anonSessionId })
      .select(
        "anon_session_id,total_generations,free_generations_used,paid_credits_remaining,has_unlimited,unlimited_until,no_watermark",
      )
      .single<UsageSessionRow>();
    if (insertError) throw insertError;
    return rowToStatus(inserted);
  }

  return rowToStatus(data);
}

export async function recordServerGeneration(
  status: ServerUsageStatus,
): Promise<ServerUsageStatus> {
  const supabase = getSupabaseAdmin();
  if (!supabase || status.source !== "supabase") {
    return {
      ...status,
      generationCount: status.generationCount + 1,
      freeRemaining: Math.max(0, status.freeRemaining - (status.paidCredits > 0 || status.hasUnlimited ? 0 : 1)),
      paidCredits: status.hasUnlimited ? status.paidCredits : Math.max(0, status.paidCredits - 1),
    };
  }

  const { data, error } = await supabase.rpc("consume_generation", {
    p_anon_session_id: status.anonSessionId,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return rowToStatus({
    anon_session_id: status.anonSessionId,
    total_generations: row.total_generations,
    free_generations_used: row.free_generations_used,
    paid_credits_remaining: row.paid_credits_remaining,
    has_unlimited: row.has_unlimited,
    unlimited_until: row.unlimited_until,
    no_watermark: row.no_watermark,
  });
}

export async function grantPurchaseToSession({
  anonSessionId,
  stripeSessionId,
  stripeCustomerId,
  productType,
  amountPaid,
}: {
  anonSessionId: string;
  stripeSessionId: string;
  stripeCustomerId?: string | null;
  productType: "refill" | "extra_crispy" | "unlimited";
  amountPaid?: number | null;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { error } = await supabase.rpc("grant_purchase", {
    p_anon_session_id: anonSessionId,
    p_stripe_session_id: stripeSessionId,
    p_stripe_customer_id: stripeCustomerId ?? null,
    p_product_type: productType,
    p_amount_paid: amountPaid ?? null,
  });
  if (error) throw error;
  return true;
}

function rowToStatus(row: UsageSessionRow): ServerUsageStatus {
  const hasUnlimited =
    row.has_unlimited &&
    (!row.unlimited_until || new Date(row.unlimited_until).getTime() > Date.now());
  const freeRemaining = Math.max(0, FREE_GENERATION_LIMIT - row.free_generations_used);

  return {
    canGenerate: hasUnlimited || row.paid_credits_remaining > 0 || freeRemaining > 0,
    anonSessionId: row.anon_session_id,
    generationCount: row.total_generations,
    freeRemaining,
    paidCredits: row.paid_credits_remaining,
    hasUnlimited,
    noWatermark: Boolean(row.no_watermark || hasUnlimited),
    paywallStage: getPaywallStage(row.total_generations),
    source: "supabase",
  };
}
